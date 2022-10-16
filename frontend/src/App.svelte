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

  interface Task {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    dueOn: Date;
    reacurence: number;
    complete: boolean;
    deleted: boolean;
    // no need to have sync because the background sync keeps track of failed post requests
  }

  let testTasks: Task[] = [
    {
      id: 1,
      content: "Do the dishes",
      createdAt: new Date(),
      updatedAt: new Date(),
      dueOn: new Date(),
      reacurence: 0,
      complete: false,
      deleted: false,
    },
    {
      id: 2,
      content: "Do the laundry",
      createdAt: new Date(),
      updatedAt: new Date(),
      dueOn: new Date(),
      reacurence: 0,
      complete: false,
      deleted: false,
    },
    {
      id: 3,
      content: "Do the homework",
      createdAt: new Date(),
      updatedAt: new Date(),
      dueOn: new Date(2025, 1, 1),
      reacurence: 0,
      complete: false,
      deleted: false,
    },
  ];

  window.addEventListener("offline", (e) => {
    onlineFlag = false;
  });
  window.addEventListener("online", (e) => {
    onlineFlag = true;
  });

  const dbrequest = window.indexedDB.open("todos");
  dbrequest.onerror = (e) => {
    console.log(e.target.error);
  };
  dbrequest.onupgradeneeded = (e) => {
    console.log("upgrading db");
    db = e.target.result;
    if (!db.objectStoreNames.contains("tasks")) {
      const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
      taskStore.createIndex("dueOn", "dueOn", { unique: false });
    }
  };
  dbrequest.onsuccess = (e) => {
    db = e.target.result;
    // let lastSynced = getPersistentLastSynced();
    // if (lastSynced) {
    //   syncWithRemote();
    // } else {
    //   let remoteTasks = getRemoteTasks();
    //   remoteTasks.then((tasks) => {
    //     addTasks(tasks);
    //   });
    //   setPersistentLastSynced();
    // }
    syncWithRemote();
    updateDisplay();
  };

  function addTasks(tasks: Task[]) {
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

    req.onsuccess = (e) => {
      console.log("task added");
    };
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
    // console.log(task);
    addTaskRemote(task); // if fail set synced to false
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
      deleted: false,
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
            return (
              task.dueOn.substring(0, 10) == date
              // task.dueOn.getDate() == new Date().getDate() &&
              // task.dueOn.getMonth() == new Date().getMonth() &&
              // task.dueOn.getFullYear() == new Date().getFullYear()
            );
          });
          // console.log(displayTasks);
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
        // let tempDisplayTasks: Task[] = [];
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

  // BUG: there might be a problem with the fields here
  function getRemoteTasks(): Promise<Task[]> {
    return fetch("http://localhost:8000/tasks")
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  function getRemoteLastUpdated(lastSynced): Promise<Task[]> {
    // let lastSynced = getPersistentLastSynced();
    // console.log(lastSynced);
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

  function syncTasks(tasks: Task[]) {
    const tx = db.transaction("tasks", "readwrite");
    const taskStore = tx.objectStore("tasks");
    tasks.forEach((task) => {
      const req = taskStore.get(task.id);
      req.onsuccess = (e) => {
        if (req.result) {
          if (task.deleted) {
            taskStore.delete(task.id);
          } else {
            taskStore.put(task);
          }
        } else {
          if (task.deleted) {
            taskStore.delete(task.id);
          } else {
            taskStore.add(task);
          }
        }
      };
    });
  }

  function syncWithRemote() {
    // let remoteTasks: Task[] = [];
    let lastSynced = getPersistentLastSynced();
    if (lastSynced) {
      getRemoteLastUpdated(lastSynced).then((tasks) => {
        // remoteTasks = tasks;
        syncTasks(tasks);
        setPersistentLastSynced();
        updateDisplay();
      });
    } else {
      getRemoteTasks().then((tasks) => {
        syncTasks(tasks);
        setPersistentLastSynced();
        updateDisplay();
      });
    }
    // let updatedSinceLastSyncTasks = getRemoteLastUpdated(lastSynced);
    // updatedSinceLastSyncTasks.then((tasks) => {
    //   // update local indexeddb
    //   createUpdateDeleteTasks(tasks);
    // });
    // this is to ensure that deleted task get removed while they are flagged as deleted on the remote db (there is a flaw as when the db periodically removes deleted tasks then a rarely used client might not be aware that a task has been deleted to offset that enure that every so often we do a full client refresh)
    // console.log(remoteTasks);
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
