<script lang="ts">
  import TaskItem from "./TaskItem.svelte";
  import { fly } from "svelte/transition";
  import Modal from "./lib/Modal.svelte";

  import type { Task } from "./types/task.type";

  import NewTask from "./NewTask.svelte";
  import Filter from "./Filter.svelte";
  import NewTaskTest from "./NewTaskTest.svelte";
  import TaskItemTest from "./TaskItemTest.svelte";

  import { openDB, deleteDB, wrap, unwrap } from "idb";
  import { onMount } from "svelte";
  import TasksTopBar from "./TasksTopBar.svelte";

  let displayTaskEditorDialog: boolean = false;

  let displayedTasks: Task[];

  // tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
  // or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be overgrowing but may be the easiest solution)

  let db: IDBPDatabase<unknown>;

  async function updateDisplayedTasks1(scope: string, showCompleted: boolean) {
    displayedTasks = await test(scope, showCompleted);
  }

  async function test(scope: string, showCompleted: boolean) {
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    const index = store.index("dueOrderComplete");
    let range;
    let bound;
    switch (scope) {
      case "unassigned":
        if (showCompleted) {
          let incomplete = [-1, 0, 0];
          let completed = [-1, 0, 1];
          let incompleteRange = IDBKeyRange.bound(incomplete, incomplete);
          let completedRange = IDBKeyRange.bound(completed, completed);
          let tasks = await index.getAll(incompleteRange);
          return tasks.concat(await index.getAll(completedRange));
        } else {
          bound = [-1, 0, 0];
          range = IDBKeyRange.bound(bound, bound);
          return await index.getAll(range);
        }
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        bound = [today, 0, 1];
        let bound2 = [today + 86400000, 0, 1];
        range = IDBKeyRange.bound(bound, bound2);
        return await index.getAll(range);
      case "upcoming":
        let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound(tmr);
        return await index.getAll(range);
      default:
        return await index.getAll();
    }
  }

  onMount(async () => {
    db = await openDB("oolongDb", 1, {
      upgrade(db) {
        console.log("Upgrading database...");
        if (!db.objectStoreNames.contains("tasks")) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
          taskStore.createIndex("due", "due", { unique: false });
          taskStore.createIndex("dueOder", ["due", "order"], {
            unique: false,
          });
          taskStore.createIndex(
            "dueOrderComplete",
            ["due", "order", "complete"],
            {
              unique: false,
            }
          );
        }
      },
    });

    displayedTasks = await test("today", false);
    // // Insert several test tasks in the database
    // Give me two tasks
    let task1: Task = {
      id: "someRandomIdString1",
      projectTag: null,
      description: "Task 1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      due: new Date("2021-01-01").getTime(),
      withTime: false,
      recurrence: 0,
      complete: 0,
      order: 0,
    };

    let task2: Task = {
      id: "someRandomIdString2",
      projectTag: null,
      description: "Task 2",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      due: new Date().getTime(),
      withTime: true,
      recurrence: 0,
      complete: 0,
      order: 0,
    };

    // task with no due date
    let task3: Task = {
      id: "someRandomIdString3",
      projectTag: null,
      description: "Task 3",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      due: -1,
      withTime: false,
      recurrence: 0,
      complete: 0,
      order: 0,
    };

    let task4: Task = {
      id: "someRandomIdString4",
      projectTag: null,
      description: "Task 4",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      due: -1,
      withTime: false,
      recurrence: 0,
      complete: 1,
      order: 0,
    };

    await db.add("tasks", task1);
    await db.add("tasks", task2);
    await db.add("tasks", task3);
    await db.add("tasks", task4);
  });

  function addTaskLocal(task: Task) {
    const req = db
      .transaction("tasks", "readwrite")
      .objectStore("tasks")
      .add(task);

    req.onerror = (e) => {
      // console.log(e.target.errorCode);
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

  function createNotification(task: Task) {
    const option = {
      body: task.content,
      icon: "https://svelte.dev/favicon.png",
      timestamp: task.due,
    };
    const notification = new Notification("Task Due", option);
    // sw.showNotification(notification);
  }

  // BUG: There seems to be a problem submitting a task on mobile devices when associated with a time
  // function saveTask(task: Task) {
  //     addTask(task);
  //     if (task.withTime) {
  //         // createNotification(task);
  //     }
  //     // createNotification(task); // BUG: add this to the add task function so that synced tasks can be notified too
  //     updateDisplay(); // better way would be to add the task to the display tasks array if it matches the filter else do nothing and rely on fetching filtered tasks when complete
  // }

  // function sort(tasks: Task[]) {
  //     return tasks.sort((a, b) => {
  //         if (a.prioritise && !b.prioritise) {
  //             return -1;
  //         } else if (!a.prioritise && b.prioritise) {
  //             return 1;
  //         } else {
  //             return 0;
  //         }
  //     });
  // }

  function sortCompleted() {
    displayedTasks = displayedTasks.filter((task) => {
      return task.complete === completed;
    });
  }

  function sortByIndex(tasks: Task[]) {
    return tasks.sort((a, b) => {
      if (a.index < b.index) {
        return -1;
      } else if (a.index > b.index) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  function getTasksToDisplay() {
    displayedTasks = [];
    const tx = db.transaction("tasks", "readonly");
    const taskStore = tx.objectStore("tasks");

    switch (display) {
      case "all":
        const allReq = taskStore.getAll();
        allReq.onsuccess = (e) => {
          displayedTasks = allReq.result;
        };
        break;
      case "today":
        {
          let today = new Date().setHours(0, 0, 0, 0);
          let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
          let range = IDBKeyRange.bound(today, tomorrow, false, true);
          const todayReq = taskStore.index("due").getAll(range);
          todayReq.onsuccess = (e) => {
            let request = e.target;
            displayedTasks = request.result;
            displayedTasks = sortByIndex(displayedTasks);
          };
        }
        break;
      case "upcoming":
        {
          let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
          let range = IDBKeyRange.lowerBound(tomorrow, false);
          const upcomingReq = taskStore.index("due").getAll(range);
          upcomingReq.onsuccess = (e) => {
            let request = e.target;
            displayedTasks = request.result;
          };
        }
        break;
      case "unassigned":
        {
          let range = IDBKeyRange.only(-1);
          const unassignedReq = taskStore.index("due").getAll(range);
          unassignedReq.onsuccess = (e) => {
            let request = e.target;
            displayedTasks = request.result;
          };
        }
        break;
    }
  }

  function updateDisplayedTasks(task: Task) {
    // if task passes filter add to display tasks else don't do anything
    if (display == "all") {
      displayedTasks = [...displayedTasks, task];
    } else if (display == "today") {
      let today = new Date().setHours(0, 0, 0, 0);
      let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
      if (task.due >= today && task.due < tomorrow) {
        // displayTasks.push(task);
        displayedTasks = [...displayedTasks, task];
        // displayTasks = sortByPrioritise(displayTasks);
      }
    } else if (display == "upcoming") {
      let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
      if (task.due >= tomorrow) {
        displayedTasks = [...displayedTasks, task];
      }
    } else if (display == "unassigned") {
      if (task.due == -1) {
        displayedTasks = [...displayedTasks, task];
      }
    }
  }

  function createTaskAndUpdateDisplay(task: Task) {
    saveTask(task);
    updateDisplayedTasks(task);
  }

  function updateTaskAndUpdateDisplay(task: Task) {
    saveTask(task);
    // if task passes filter add to display tasks else don't do anything
    if (display == "all") {
      displayedTasks = [...displayedTasks];
    } else if (display == "today") {
      let today = new Date().setHours(0, 0, 0, 0);
      let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
      if (task.due >= today && task.due < tomorrow) {
        // displayTasks.push(task);
        displayedTasks = [...displayedTasks];
        // displayTasks = sortByPrioritise(displayTasks);
      } else {
        displayedTasks = displayedTasks.filter((t) => t.id != task.id);
      }
    } else if (display == "upcoming") {
      let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
      if (task.due >= tomorrow) {
        displayedTasks = [...displayedTasks];
      } else {
        displayedTasks = displayedTasks.filter((t) => t.id != task.id);
      }
    } else if (display == "unassigned") {
      if (task.due == -1) {
        displayedTasks = [...displayedTasks];
      } else {
        displayedTasks = displayedTasks.filter((t) => t.id != task.id);
      }
    }
  }

  function deleteTaskAndUpdateDisplay(task: Task) {
    deleteTask(task);
    displayedTasks = displayedTasks.filter((t) => t.id != task.id);
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
      if (task.withTime) {
        // createNotification(task);
      }
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
        getTasksToDisplay();
      });
    } else {
      getRemoteTasks().then((tasks) => {
        createOrUppdateTasks(tasks);
        setPersistentLastSynced();
        getTasksToDisplay();
      });
    }
  }

  function saveTask(task: Task): void {
    const tx = db.transaction("tasks", "readwrite");
    const taskStore = tx.objectStore("tasks");
    taskStore.put(task);
    // TODO: Do remote as well
  }

  function deleteTask(task: Task): void {
    const tx = db.transaction("tasks", "readwrite");
    const taskStore = tx.objectStore("tasks");
    taskStore.delete(task.id);
  }

  function showNotification() {
    // https://chromestatus.com/feature/5133150283890688
    if ("showTrigger" in Notification.prototype) {
      /* Notification Triggers supported */
      console.log("Notification Triggers supported");
    }
    Notification.requestPermission((result) => {
      if (result === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Vibration Sample", {
            body: "Buzz! Buzz!",
            icon: "../images/touch/chrome-touch-icon-192x192.png",
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: "vibration-sample",
            showTrigger: new TimestampTrigger(10),
          });
        });
      }
    });
  }

  function updateDisplayedTask() {
    displayedTasks = [...displayedTasks];
  }

  // getTasks from IndexedDB based on the current scope and showCompleted setting
  async function getTasks(db): Promise<Task[]> {
    // let db = await openDB("oolongDb", 1);
    let tx = await db.transaction("tasks", "readonly");
    let taskStore = tx.objectStore("tasks");
    let dueIndex = taskStore.index("due");

    let range;
    switch (scope) {
      case "unassigned":
        // Get where due is -1
        range = IDBKeyRange.bound(-1, -1);
        return await dueIndex.getAll(range);
      case "today":
        // get where due as iso string is today
        let today = new Date().setHours(0, 0, 0, 0);
        range = IDBKeyRange.bound(today, today + 86400000);
        return await dueIndex.getAll(range);
      case "upcoming":
        // get where due as iso string is in the future
        let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound(tomorrow);
        return await dueIndex.getAll(range);
      default:
        return await taskStore.getAll();
    }
  }
</script>

<TasksTopBar
  on:changeScope={(e) => {
    updateDisplayedTasks1(e.detail[0], e.detail[1]);
  }}
  on:toggleCompleted={(e) => {
    updateDisplayedTasks1(e.detail[0], e.detail[1]);
  }}
/>

<div id="main">
  <!-- <Filter bind:display bind:completed {getTasksToDisplay} {sortCompleted} /> -->

  <!-- TODO: Have the ability to define a custom order in unasigned and today i.e. by default add newer requests at the end but have the ability to move round to re-prioritise -->
  <!-- if no tasks to display -->
  <!-- {#if displayTasks.length == 0 && display == "today"}
    <div class="no-tasks">
      <img src="Oolongv1.png" alt="" width="300px" />
      <p>Yay! You're done for the day - enjoy :)</p>
    </div>
  {:else} -->
  <div class="tasks">
    {#if displayedTasks}
      {#each displayedTasks as task}
        <TaskItemTest {task} />
      {/each}
    {/if}

    <!-- {#each tasks as task}
        <TaskItemTest {task} />
      {/each} -->
    <!-- {/await} -->

    <!-- {#each getTasks() as task} -->
    <!-- <TaskItem
        bind:task
        {updateTaskAndUpdateDisplay}
        {deleteTaskAndUpdateDisplay}
      /> -->
    <!-- {task.id} -->
    <!-- <TaskItemTest bind:task /> -->
    <!-- {/each} -->
  </div>
  <!-- {/if} -->

  <button
    on:click={() => {
      displayTaskEditorDialog = true;
    }}>+</button
  >

  <!-- {#if displayTaskEditorModal}
        <div transition:fly={{ y: 100, duration: 100 }}><NewTaskTest /></div>
    {/if} -->
  <button on:click={() => (displayTaskEditorDialog = true)}> + </button>
  {#if displayTaskEditorDialog}
    <!-- <NewTask
            displayTasksLenghth={displayTasks.length}
            bind:displayTaskEditorModal
            {createTaskAndUpdateDisplay}
        /> -->
    <Modal on:close={() => (displayTaskEditorDialog = false)}>
      <NewTaskTest on:close={() => (displayTaskEditorDialog = false)} />
    </Modal>
  {/if}
</div>

<style>
  /* center horizontally and vertically */
  .no-tasks {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  /* center content with max width */
  #main {
    max-width: 800px;
    margin: 0 auto;
  }

  /* center button at bottom of screen */
  button {
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* large round button */
  button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: black;
    color: white;
    font-size: 30px;
    border: none;
    outline: none;
    cursor: pointer;
  }
</style>
