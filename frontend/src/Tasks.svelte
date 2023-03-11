<script lang="ts">
  import Modal from "./lib/Modal.svelte";

  import type { Task } from "./types/task.type";

  import NewTaskTest from "./NewTaskTest.svelte";
  import TaskItemTest from "./TaskItemTest.svelte";

  import { openDB } from "idb";
  import { onMount } from "svelte";
  import TasksTopBar from "./TasksTopBar.svelte";

  let displayTaskEditorDialog: boolean = false;

  let incompleteDisplayedTasks: Task[];
  let completedDisplayedTasks: Task[];

  // FEATURE: Want to handle toggle completed tasks a little differently:
  // - make completed tasks a new separate scope (like today, upcoming, unassigned)
  // - have a button to see completed tasks specific to the today scope (so we get a sense of what we've achieved today)

  // tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
  // or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be overgrowing but may be the easiest solution)

  let db: IDBPDatabase<unknown>;

  async function updateDisplayedTasks1(scope: string, showCompleted: boolean) {
    if (showCompleted) {
      completedDisplayedTasks = await getCompletedTasks(scope);
    } else {
      completedDisplayedTasks = null;
    }
    incompleteDisplayedTasks = await getIncompleteTasksTimeline(scope);
  }

  async function getCompletedTasks(scope: string): Promise<Task[]> {
    const tx = db.transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed
    let range;
    let bound;
    switch (scope) {
      case "unassigned":
        range = IDBKeyRange.bound(-1, -1);
        return await index.getAll(range);
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        range = IDBKeyRange.bound(today, today);
        return await index.getAll(range);
      case "upcoming":
        let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound(tmr);
        return await index.getAll(range);
      default:
        return await index.getAll();
    }
  }

  async function getIncompleteTasksTimeline(scope: string) {
    const tx = db.transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");
    let range;
    let bound;
    switch (scope) {
      case "unassigned":
        let lwrbound = [-1, 0];
        let upperbound = [-1, Infinity];
        range = IDBKeyRange.bound(lwrbound, upperbound);
        return await index.getAll(range);
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        bound = [today, 0];
        let bound2 = [today + 86400000, Infinity];
        range = IDBKeyRange.bound(bound, bound2);
        return await index.getAll(range);
      case "upcoming":
        let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound([tmr, 0]);
        return await index.getAll(range);
      default:
        return await index.getAll();
    }
  }

  onMount(async () => {
    db = await openDB("oolongDb", 1, {
      upgrade(db) {
        console.log("Upgrading database...");
        if (!db.objectStoreNames.contains("incompleteTasks")) {
          const incompleteTasks = db.createObjectStore("incompleteTasks", {
            keyPath: "id",
          });
          incompleteTasks.createIndex(
            "dueOnListOrder",
            ["dueOn", "listOrder"],
            {
              unique: false,
            }
          );
          incompleteTasks.createIndex(
            "projectLabelLaneLaneOrder",
            ["projectLabel", "lane", "laneOrder"],
            {
              unique: false,
            }
          );
        }
        if (!db.objectStoreNames.contains("completedTasks")) {
          const completedTasks = db.createObjectStore("completedTasks", {
            keyPath: "id",
          });
          completedTasks.createIndex(
            "dueOnCompletedAt",
            ["dueOn", "completedAt"],
            {
              unique: false,
            }
          );
        }
      },
    });

    // Pull the scope and showCompleted from the the TasksTopBar component
    incompleteDisplayedTasks = await getIncompleteTasksTimeline("today");
    // // Insert several test tasks in the database
    // Give me two tasks
    let task1: Task = {
      id: "someRandomIdString1",
      projectLabel: null,
      description: "Task 1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueOn: new Date("2021-01-01").setHours(0, 0, 0, 0),
      dueAt: new Date("2021-01-01").getTime(),
      recurrence: 0,
      lane: null,
      listOrder: 0,
      laneOrder: 0,
      completedAt: null,
    };

    let task2: Task = {
      id: "someRandomIdString2",
      projectLabel: null,
      description: "Task 2",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueOn: new Date().setHours(0, 0, 0, 0),
      dueAt: new Date().getTime(),
      recurrence: 0,
      lane: null,
      listOrder: 0,
      laneOrder: 0,
      completedAt: null,
    };

    // task with no due date
    let task3: Task = {
      id: "someRandomIdString3",
      projectLabel: null,
      description: "Task 3",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueOn: -1,
      dueAt: null,
      recurrence: 0,
      lane: null,
      listOrder: 0,
      laneOrder: 0,
      completedAt: null,
    };

    let task4: Task = {
      id: "someRandomIdString4",
      projectLabel: null,
      description: "Task 4",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueOn: -1,
      dueAt: null,
      recurrence: 0,
      lane: null,
      listOrder: 0,
      laneOrder: 0,
      completedAt: null,
    };

    let task5: Task = {
      id: "someRandomIdString5",
      projectLabel: null,
      description: "Task 5",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueOn: Date.now() + 86400000,
      dueAt: null,
      recurrence: 0,
      lane: null,
      listOrder: 0,
      laneOrder: 0,
      completedAt: null,
    };

    db.add("incompleteTasks", task1);
    db.add("incompleteTasks", task2);
    db.add("incompleteTasks", task3);
    db.add("incompleteTasks", task4);
    db.add("incompleteTasks", task5);
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

  // Show a notification offline (by scheduling it) is not supported yet
  // https://chromestatus.com/feature/5133150283890688
  // function showNotification() {
  //   if ("showTrigger" in Notification.prototype) {
  //     /* Notification Triggers supported */
  //     console.log("Notification Triggers supported");
  //   }
  //   Notification.requestPermission((result) => {
  //     if (result === "granted") {
  //       navigator.serviceWorker.ready.then((registration) => {
  //         registration.showNotification("Vibration Sample", {
  //           body: "Buzz! Buzz!",
  //           icon: "../images/touch/chrome-touch-icon-192x192.png",
  //           vibrate: [200, 100, 200, 100, 200, 100, 200],
  //           tag: "vibration-sample",
  //           showTrigger: new TimestampTrigger(10),
  //         });
  //       });
  //     }
  //   });
  // }

  // https://github.com/isaacHagoel/svelte-dnd-action
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  let dragDisabled = true;

  const flipDurationMs = 0;
  function handleDndConsider(e) {
    incompleteDisplayedTasks = e.detail.items;
    // small vibration
    navigator.vibrate(5);
  }
  async function handleDndFinalize(e) {
    incompleteDisplayedTasks = e.detail.items;
    // update the order of the tasks
    incompleteDisplayedTasks.forEach((task, index) => {
      task.listOrder = index;
      db.put("incompleteTasks", task);
    });
  }

  async function addTaskTest(task: Task) {
    db.put("incompleteTasks", task);
    incompleteDisplayedTasks = await getIncompleteTasksTimeline("today");
  }

  function newBlankTask(): Task {
    return {
      id: undefined,
      projectLabel: null,
      description: "",
      createdAt: undefined,
      updatedAt: undefined,
      dueOn: -1, // by default no due date
      dueAt: null,
      recurrence: 0,
      lane: null,
      listOrder: Infinity,
      laneOrder: Infinity,
      completedAt: undefined,
    };
  }

  let taskCursor: Task = newBlankTask();

  function editTask(task: Task) {
    displayTaskEditorDialog = true;
    // overwrite the taskCursor with the task to edit
    taskCursor = task;
  }
</script>

<TasksTopBar
  on:changeScope={(e) => {
    updateDisplayedTasks1(e.detail[0], e.detail[1]);
    if (e.detail[0] == "today" || e.detail[0] == "unassigned") {
      dragDisabled = false;
    } else {
      dragDisabled = true;
    }
  }}
  on:toggleCompleted={(e) => {
    updateDisplayedTasks1(e.detail[0], e.detail[1]);
    // If completedDisplayed tasks is null then set to null
  }}
/>

<div id="main">
  {#if incompleteDisplayedTasks}
    <!-- Only enable re-ordering on today and unordered -->
    <div
      class="tasks"
      use:dndzone={{
        items: incompleteDisplayedTasks,
        flipDurationMs,
        dragDisabled,
      }}
      on:consider={handleDndConsider}
      on:finalize={handleDndFinalize}
    >
      {#each incompleteDisplayedTasks as task (task.id)}
        <div
          animate:flip={{ duration: flipDurationMs }}
          on:click={() => editTask(task)}
        >
          <TaskItemTest {task} />
        </div>
      {/each}
    </div>

    {#if completedDisplayedTasks}
      <hr />
      {#each completedDisplayedTasks as task}
        <TaskItemTest {task} />
      {/each}
    {/if}
  {/if}

  <button on:click={() => (displayTaskEditorDialog = true)}> + </button>

  {#if displayTaskEditorDialog}
    <Modal on:close={() => (displayTaskEditorDialog = false)}>
      <NewTaskTest
        task={taskCursor}
        on:close={() => {
          displayTaskEditorDialog = false;
          taskCursor = newBlankTask();
        }}
        on:newTask={(e) => {
          console.log(e.detail);
          addTaskTest(e.detail);
          displayTaskEditorDialog = false;
        }}
      />
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
