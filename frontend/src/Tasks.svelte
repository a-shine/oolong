<script lang="ts">
  import { openDB } from "idb";
  import { dndzone } from "svelte-dnd-action"; // https://github.com/isaacHagoel/svelte-dnd-action
  import { flip } from "svelte/animate";

  import Modal from "./lib/Modal.svelte";

  import type { Task } from "./types/task.type";

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TaskItem from "./TaskItem.svelte";

  let displayTaskEditorDialog: boolean = false;

  let incompleteDisplayedTasks: Task[];
  let completedDisplayedTasks: Task[];

  // TODO: clean and comment

  // Get the database promise and create the object stores if required
  const db = openDB("oolongDb", 1, {
    upgrade(db) {
      console.log("Upgrading database...");
      if (!db.objectStoreNames.contains("incompleteTasks")) {
        const incompleteTasks = db.createObjectStore("incompleteTasks", {
          keyPath: "id",
        });
        incompleteTasks.createIndex("dueOnListOrder", ["dueOn", "listOrder"], {
          unique: false,
        });
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

  async function getCompletedTasks(scope: string): Promise<Task[]> {
    const tx = (await db).transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed
    switch (scope) {
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        let range = IDBKeyRange.bound(
          [today, 0],
          [today + 86400000, Infinity],
          false,
          true
        );
        return await index.getAll(range);
      case "completed":
        return await index.getAll();
      default:
        return await index.getAll();
    }
  }

  async function getIncompleteTasksTimeline(scope: string) {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");
    let range;
    switch (scope) {
      case "unassigned":
        let firstUnassignedTask = [-1, 0];
        let lastUnassignedTask = [-1, Infinity];
        range = IDBKeyRange.bound(firstUnassignedTask, lastUnassignedTask);
        return await index.getAll(range);
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        let firstTaskToday = [today, 0];
        let firstTaskTmr = [today + 86400000, 0];
        range = IDBKeyRange.bound(firstTaskToday, firstTaskTmr, false, true);
        return await index.getAll(range);
      case "upcoming":
        let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound([tmr, 0]);
        return await index.getAll(range);
      default:
        return await index.getAll();
    }
  }

  function addTaskRemote(task: Task) {
    var response = fetch("http://localhost:8000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
  }

  function addTask(task: Task) {
    addTaskRemote(task);
    addTaskLocal(task);
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

  // Eventually the database will clear out old tasks so have a period full sync of the database in case (or keep a record of replicas)
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

  let dragDisabled = true;

  const flipDurationMs = 100;
  function handleDndConsider(e) {
    incompleteDisplayedTasks = e.detail.items;
    // small vibration
    navigator.vibrate(5);
  }
  async function handleDndFinalize(e) {
    incompleteDisplayedTasks = e.detail.items;
    // update the order of the tasks
    for (let i = 0; i < incompleteDisplayedTasks.length; i++) {
      incompleteDisplayedTasks[i].listOrder = i;
      (await db).put("incompleteTasks", incompleteDisplayedTasks[i]);
    }
  }

  async function addTaskTest(task: Task) {
    (await db).put("incompleteTasks", task);
    // TODO: update the displayed tasks with the current scope
    // incompleteDisplayedTasks = await getIncompleteTasksTimeline("today");
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

  async function completeTask(task: Task) {
    task.completedAt = Date.now();
    (await db).put("completedTasks", task);
    (await db).delete("incompleteTasks", task.id);
    // TODO: update the displayed tasks with the current scope
    // incompleteDisplayedTasks = await getIncompleteTasksTimeline("today");
  }

  let taskCursor: Task = newBlankTask();

  function editTask(task: Task) {
    displayTaskEditorDialog = true;
    taskCursor = task; // overwrite the taskCursor with the task to edit
  }
</script>

<TasksTopBar
  on:changeScope={async (e) => {
    // BUG: this is not working as expected should be able to use completedDisplay tasks
    switch (e.detail[0]) {
      case "completed":
        console.log("completed");
        // incompleteDisplayedTasks = null;
        // completedDisplayedTasks = [];
        incompleteDisplayedTasks = await getCompletedTasks(e.detail[0]);
        console.log(completedDisplayedTasks);
        break;
      default:
        completedDisplayedTasks = null;
        incompleteDisplayedTasks = await getIncompleteTasksTimeline(
          e.detail[0]
        );
    }

    // Disable re-ordering if not today or unassigned
    if (e.detail[0] == "today" || e.detail[0] == "unassigned") {
      dragDisabled = false;
    } else {
      dragDisabled = true;
    }
  }}
  on:toggleCompletedToday={async (e) => {
    console.log("toggleCompletedToday");
    if (e.detail[1]) {
      completedDisplayedTasks = await getCompletedTasks("today");
    } else {
      completedDisplayedTasks = null;
    }
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
        <div animate:flip={{ duration: flipDurationMs }}>
          <TaskItem
            {task}
            on:toggleEdit={(e) => editTask(e.detail)}
            on:toggleDone={(e) => completeTask(e.detail)}
          />
        </div>
      {/each}
    </div>

    {#if completedDisplayedTasks}
      <hr />
      {#each completedDisplayedTasks as task}
        <TaskItem {task} />
      {/each}
    {/if}
  {/if}

  <button id="newTaskButton" on:click={() => (displayTaskEditorDialog = true)}>
    +
  </button>

  {#if displayTaskEditorDialog}
    <Modal on:close={() => (displayTaskEditorDialog = false)}>
      <TaskEditor
        task={taskCursor}
        on:close={() => {
          displayTaskEditorDialog = false;
          taskCursor = newBlankTask();
        }}
        on:newTask={(e) => {
          addTaskTest(e.detail);
          taskCursor = newBlankTask();
          displayTaskEditorDialog = false;
        }}
      />
    </Modal>
  {/if}
</div>

<style>
  /* center content with max width */
  #main {
    max-width: 800px;
    margin: 0 auto;
  }

  /* large round button center bottom of the screen */
  #newTaskButton {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    font-size: 30px;
    border: none;
    outline: none;
    cursor: pointer;
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
