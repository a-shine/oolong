<script lang="ts">
  import { onMount } from "svelte";
  import Modal from "./lib/Modal.svelte";
  import { v4 as uuidv4 } from "uuid";

  let display: string;
  let displayTasks: Task[] = [];
  let onlineFlag: boolean;
  let db;
  let displayTaskAdder: boolean = false;

  let newTaskContent: string;
  let newTaskDate: Date;
  let newTaskTime;

  // tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
  // or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be evergrowing but may be the easiet solution)

  interface Task {
    id: string;
    projectId: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    dueOn: string; // use the timestamp and get the between range for the specified dates + 0 for undefined
    dueAt: string;
    reacurence: number;
    complete: boolean;
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
      dueOn = newTaskDate;
    } else {
      dueOn = "";
    }
    const task: Task = {
      id: uuidv4(),
      projectId: null,
      content: newTaskContent,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueOn: dueOn,
      dueAt: newTaskTime,
      reacurence: null,
      complete: false,
    };
    addTask(task);
    updateDisplay();
    newTaskContent = "";
    newTaskDate = undefined;
    newTaskTime = undefined;
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
        {
          let today = new Date();
          let bound = today.toISOString().split("T")[0];
          let range = IDBKeyRange.only(bound);
          const todayReq = taskStore.index("dueOn").getAll(range);
          todayReq.onsuccess = (e) => {
            let request = e.target;
            displayTasks = request.result;
          };
        }
        break;
      case "upcoming":
        {
          let today = new Date();
          let bound = today.toISOString().split("T")[0];
          let range = IDBKeyRange.lowerBound(bound, true);
          const upcomingReq = taskStore.index("dueOn").getAll(range);
          upcomingReq.onsuccess = (e) => {
            let request = e.target;
            displayTasks = request.result;
          };
        }
        break;
      case "unassigned":
        {
          let range = IDBKeyRange.only("");
          const unassignedReq = taskStore.index("dueOn").getAll(range);
          unassignedReq.onsuccess = (e) => {
            let request = e.target;
            displayTasks = request.result;
          };
        }
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
        console.log(data);
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
      Promise.all([
        getRemoteLastUpdated(lastSynced),
        getRemoteDeletedSince(lastSynced),
      ]).then((tasks) => {
        createOrUppdateTasks(tasks[0]);
        deleteTasks(tasks[1]);
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
        <label for="dueAt">At</label>
        <input type="time" id="dueAt" bind:value={newTaskTime} />
        <button type="submit">Add</button>
      </form>
    </Modal>
  {/if}
</main>

<style>
</style>
