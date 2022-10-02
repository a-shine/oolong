<script lang="ts">
  import { onMount } from "svelte";
  import Modal from "./lib/Modal.svelte";

  // BUG: Not working with undefined date

  let display: string;
  let displayTasks: Task[] = [];
  let onlineFlag: boolean;
  let db;
  let displayTaskAdder: boolean = false;

  let newTaskContent: string;
  let newTaskDate: Date;

  interface Task {
    id: number;
    content: string;
    createdAt: Date;
    dueOn: Date;
    reacurence: number | null;
    complete: boolean;
    synced: boolean;
  }

  let testTasks: Task[] = [
    {
      id: 1,
      content: "Do the dishes",
      createdAt: new Date(),
      dueOn: new Date(),
      reacurence: 0,
      complete: false,
      synced: false,
    },
    {
      id: 2,
      content: "Do the laundry",
      createdAt: new Date(),
      dueOn: new Date(),
      reacurence: 0,
      complete: false,
      synced: false,
    },
    {
      id: 3,
      content: "Do the homework",
      createdAt: new Date(),
      dueOn: new Date(2025, 1, 1),
      reacurence: 0,
      complete: false,
      synced: false,
    },
  ];

  window.addEventListener("offline", (e) => {
    console.log("offline");
    onlineFlag = false;
  });
  window.addEventListener("online", (e) => {
    console.log("online");
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
    // addTasks(testTasks); // when testing
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
      const req = taskStore.add(task);
      req.onsuccess = (e) => {
        console.log("task added");
      };
      req.onerror = (e) => {
        console.log(e.target.errorCode);
      };
    });
  }

  function addTask(task: Task) {
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
      dueOn: dueOn,
      reacurence: null,
      complete: false,
      synced: false,
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
          console.log(displayTasks);
        };
        break;
      case "today":
        const todayReq = taskStore.index("dueOn").getAll();
        todayReq.onsuccess = (e) => {
          displayTasks = todayReq.result.filter((task) => {
            // console.log(task.dueOn);
            return (
              task.dueOn.getDate() == new Date().getDate() &&
              task.dueOn.getMonth() == new Date().getMonth() &&
              task.dueOn.getFullYear() == new Date().getFullYear()
            );
          });
          console.log(displayTasks);
        };
        break;
      case "upcoming":
        const upcomingReq = taskStore.index("dueOn").getAll();
        upcomingReq.onsuccess = (e) => {
          displayTasks = upcomingReq.result.filter((task) => {
            return task.dueOn > new Date();
          });
        };
        break;
      case "unassigned":
        // let tempDisplayTasks: Task[] = [];
        const unassignedReq = taskStore.index("dueOn").getAll();
        unassignedReq.onsuccess = (e) => {
          displayTasks = unassignedReq.result.filter((task) => {
            return task.dueOn.getTime() == 0;
          });
        };
        // };
        // console.log(tempDisplayTasks);
        // displayTasks = tempDisplayTasks;
        break;
    }
  }

  onMount(() => {
    if (navigator.onLine) {
      onlineFlag = true;
    } else {
      onlineFlag = false;
    }

    display = "today";
    // updateDisplay();
    console.log(testTasks);
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
        <input type="text" id="content" bind:value={newTaskContent} />
        <label for="dueOn">Due on</label>
        <input type="date" id="dueOn" bind:value={newTaskDate} />
        <button type="submit">Add</button>
      </form>
    </Modal>
  {/if}
</main>

<style>
</style>
