<script lang="ts">
  import { onMount } from "svelte";
  import Modal from "./lib/Modal.svelte";

  let display: string;
  let displayTasks: Task[] = [];
  let onlineFlag: boolean;
  let db;
  let displayTaskAdder: boolean = false;

  let newTaskContent: string;
  let newTaskDate: Date;

  // tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
  // or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be evergrowing but may be the easiet solution)

  // TODO: abstract away deleted property from client - have a route that enables getting deletedSince lastSynced and delete based of that

  interface Task {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    dueOn: Date;
    reacurence: number;
    complete: boolean;
    // deleted: boolean;
    // no need to have sync because the background sync keeps track of failed post requests
  }

  window.addEventListener("offline", (e) => {
    onlineFlag = false;
  });
  window.addEventListener("online", (e) => {
    onlineFlag = true;
  });

  const dbrequest = window.indexedDB.open("todos");
  dbrequest.onsuccess = (e) => {
    db = e.target.result;
    syncWithRemote();
    updateDisplay();
  };
  dbrequest.onupgradeneeded = (e) => {
    console.log("upgrading db");
    db = e.target.result;
    if (!db.objectStoreNames.contains("tasks")) {
      const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
      taskStore.createIndex("dueOn", "dueOn", { unique: false });
    }
  };
  dbrequest.onerror = (e) => {
    console.log(e.target.error);
  };

  function addTasksLocal(tasks: Task[]) {
    const tx = db.transaction("tasks", "readwrite");

    tx.oncomplete = (e) => {
      console.log("transaction complete");
    };

    tx.onerror = (e) => {
      console.log("e.target.errorCode");
    };

    const taskStore = tx.objectStore("tasks");

    tasks.forEach((task) => {
      // task.dueOn = new Date(task.dueOn); // convert due on
      const req = taskStore.add(task);
      req.onerror = (e) => {
        console.log(e.target.errorCode);
      };
    });
  }

  function addTaskLocal(task: Task) {
    const req = db
      .transaction("tasks", "readwrite")
      .objectStore("tasks")
      .add(task);

    req.onerror = (e) => {
      console.log(e.target.errorCode);
    };
  }

  function addTaskRemote(task: Task) {
    var response = fetch("http://localhost:8000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    console.log(response);
  }

  function addTask(task: Task) {
    addTaskRemote(task);
    addTaskLocal(task);
  }

  function submitTask() {
    let dueOn;
    if (newTaskDate) {
      dueOn = new Date(newTaskDate);
    } else {
      dueOn = new Date(0);
    }
    const task: Task = {
      id: Date.now(), // todo: change id to ssn
      content: newTaskContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueOn: dueOn,
      reacurence: null,
      complete: false,
      // deleted: false,
    };
    addTask(task);
    updateDisplay();
    newTaskContent = "";
    newTaskDate = undefined;
    displayTaskAdder = false;
  }

  function updateDisplay() {
    displayTasks = [];
    const tx = db.transaction("tasks", "readonly");
    const taskStore = tx.objectStore("tasks");

    switch (display) {
      case "all":
        const allReq = taskStore.getAll();
        allReq.onsuccess = (e) => {
          displayTasks = allReq.result;
        };
        break;
      case "today":
        const todayReq = taskStore.index("dueOn").getAll();
        todayReq.onsuccess = (e) => {
          let date = new Date().toISOString().substring(0, 10);
          displayTasks = todayReq.result.filter((task) => {
            return task.dueOn.substring(0, 10) == date;
          });
        };
        break;
      case "upcoming":
        const upcomingReq = taskStore.index("dueOn").getAll();
        upcomingReq.onsuccess = (e) => {
          displayTasks = upcomingReq.result.filter((task) => {
            return task.dueOn > new Date().toISOString(); // BUG: Not sure if this logic works when comparing strings
          });
        };
        break;
      case "unassigned":
        const unassignedReq = taskStore.index("dueOn").getAll();
        unassignedReq.onsuccess = (e) => {
          displayTasks = unassignedReq.result.filter((task) => {
            return task.dueOn == ""; // BUG: needs to be some logical null value
          });
        };
        break;
    }
  }

  function getPersistentLastSynced() {
    return localStorage.getItem("lastSynced");
  }

  function setPersistentLastSynced() {
    localStorage.setItem("lastSynced", new Date().toISOString());
  }

  function getRemoteTasks(): Promise<Task[]> {
    return fetch("http://localhost:8000/tasks")
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  function getRemoteLastUpdated(lastSynced): Promise<Task[]> {
    return fetch("http://localhost:8000/tasks/updatedSince", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lastSynced: lastSynced }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  function createOrUppdateTasks(tasks: Task[]) {
    const tx = db.transaction("tasks", "readwrite");
    const taskStore = tx.objectStore("tasks");
    tasks.forEach((task) => {
      // const req = taskStore.get(task.id);
      // req.onsuccess = (e) => {
      //   if (req.result) {
      //     if (task.deleted) {
      //       taskStore.delete(task.id);
      //     } else {
      //       taskStore.put(task);
      //     }
      //   } else {
      //     if (task.deleted) {
      //       taskStore.delete(task.id);
      //     } else {
      //       taskStore.add(task);
      //     }
      //   }
      // };
      taskStore.put(task);
    });
  }

  function deleteTasks(tasks: Task[]) {
    const tx = db.transaction("tasks", "readwrite");
    const taskStore = tx.objectStore("tasks");
    tasks.forEach((task) => {
      taskStore.delete(task.id);
    });
  }

  function getRemoteDeletedSince(lastSynced): Promise<Task[]> {
    return fetch("http://localhost:8000/tasks/deletedSince", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lastSynced: lastSynced }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  function syncWithRemote() {
    // let remoteTasks: Task[] = [];
    let lastSynced = getPersistentLastSynced();
    if (lastSynced) {
      getRemoteLastUpdated(lastSynced).then((tasks) => {
        // remoteTasks = tasks;
        console.log("Tasks updated since last sync: ", tasks);
        createOrUppdateTasks(tasks);
        // setPersistentLastSynced();
        // updateDisplay();
      });
      getRemoteDeletedSince(lastSynced).then((tasks) => {
        // remoteTasks = remoteTasks.concat(tasks);
        console.log("Tasks deleted since last sync: ", tasks);
        deleteTasks(tasks);
        // setPersistentLastSynced();
        // updateDisplay();
      });
      Promise.all([
        getRemoteLastUpdated(lastSynced),
        getRemoteDeletedSince(lastSynced),
      ]).then((tasks) => {
        setPersistentLastSynced();
        updateDisplay();
      });
    } else {
      getRemoteTasks().then((tasks) => {
        createOrUppdateTasks(tasks);
        setPersistentLastSynced();
        updateDisplay();
      });
    }
  }

  onMount(() => {
    if (navigator.onLine) {
      onlineFlag = true;
    } else {
      onlineFlag = false;
    }

    display = "today";
  });
</script>

<main>
  {#if onlineFlag}
    <span>online</span>
  {:else}
    <span>offline</span>
  {/if}
  <h1>Tasks</h1>
  <select bind:value={display} on:change={updateDisplay}>
    <option value="unassigned">Unassigned</option>
    <option value="today">Today</option>
    <option value="upcoming">Upcoming</option>
    <option value="all">All</option>
  </select>
  <!-- toggle completed -->
  <label for="completedToggle">Toogle completed</label>
  <input type="checkbox" id="completedToggle" />
  <ul>
    {#each displayTasks as task}
      <li>{task.content}</li>
    {/each}
  </ul>
  <button on:click={() => (displayTaskAdder = true)}> New task </button>
  {#if displayTaskAdder}
    <Modal on:close={() => (displayTaskAdder = false)}>
      <h2 slot="header">New task</h2>
      <form on:submit|preventDefault={submitTask} autocomplete="off">
        <label for="task">Task</label>
        <input type="text" id="task" bind:value={newTaskContent} />
        <label for="dueOn">Due on</label>
        <input type="date" id="dueOn" bind:value={newTaskDate} />
        <button type="submit">Add</button>
      </form>
    </Modal>
  {/if}
</main>

<style>
</style>
