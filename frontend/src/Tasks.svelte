<script lang="ts">
  import { openDB } from "idb";

  import type { Task } from "./types/task.type";

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";

  
  // Displayed tasks are determined by the scope, on changes to scope, the task
  // list is updated
  let scope: string = "today";

  // The task that is currently being edited (undefined if no task is being 
  // edited)
  // WARNING: It is important that this is undefined and not null as null is a value while undefined is not and so when setting the value to null you actually provide a value to the prop while with undefined you use the default value
  let taskCursor: Task = undefined;

  
  let displayTaskEditor: boolean = false;


  // Open a connection to the local (IndexedDB) database. Create/modify the
  // necessary object stores if the version has changed.
  const db = openDB("oolongDb", 1, {
    upgrade(db) {
      // Creating object store for incomplete tasks
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

      // Creating object store for completed tasks
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

  /**
   * @returns a promise of the tasks list based on the component scope setting
   */
  async function getTasks(): Promise<Task[]> {
    switch (scope) {
      case "unassigned":
        return await getUnassignedTasks();
      case "upcoming":
        return await getUpcomingTasks();
      case "completed":
        return await getCompletedTasks();
      default:
        return;
    }
  }

  /**
   * Get all completed tasks from the local (IndexedDB) database
   */
  async function getCompletedTasks(): Promise<Task[]> {
    const tx = (await db).transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");

    // Completed tasks in order of due date and then completion date
    const index = store.index("dueOnCompletedAt");
    return await index.getAll();
  }

  /**
   * Get all upcoming tasks (tasks due from tomorrow onwards) from the local 
   * (IndexedDB) database
   */
  async function getUpcomingTasks() {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");

    let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
    let range = IDBKeyRange.lowerBound([tmr, 0]);
    return await index.getAll(range);
  }

  /**
   * Get all unassigned tasks (tasks where dueOn is set to -1) from the local 
   * (IndexedDB) database
   */
  async function getUnassignedTasks(): Promise<Task[]> {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    
    const index = store.index("dueOnListOrder");
    
    // Tasks with dueOn set to -1
    let range = IDBKeyRange.bound([-1, 0], [-1, Infinity]);
    
    return await index.getAll(range);
  }

  /**
   * Open the task editor for the given task (by setting the taskCursor)
  */
  function editTask(task: Task) {
    taskCursor = task;
    displayTaskEditor = true;
  }

  async function deleteTask(task: Task) {
    (await db).delete("incompleteTasks", task.id);
  }

  async function putTaskLocalDb(task: Task) {
    (await db).put("incompleteTasks", task);
  }
</script>

{#if displayTaskEditor}
  <div class="center">
    <TaskEditor
      task={taskCursor}
      on:close={() => {
        displayTaskEditor = false;
        taskCursor = undefined;
      }}
      on:saveTask={(e) => {
        putTaskLocalDb(e.detail);
        displayTaskEditor = false;
        taskCursor = undefined;
      }}
      on:deleteTask={(e) => {
        deleteTask(e.detail);
        displayTaskEditor = false;
        taskCursor = undefined;
      }}
    />
  </div>
{:else}
  <TasksTopBar bind:scope />

  <div id="container">
    <div id="tasks" class="center">
      {#await db}
        <div>Loading...</div>
      {:then db}
        {#key scope}
          {#if scope == "today"}
            <TodayView {db} on:toggleEdit={(e) => editTask(e.detail)} />
          {:else}
            {#await getTasks() then tasks}
              <TaskList
                {db}
                {tasks}
                on:toggleEdit={(e) => editTask(e.detail)}
              />
            {/await}
          {/if}
        {/key}
      {/await}
    </div>
  </div>

  <div id="bottomBar" class="bg-primary">
    <button
      id="newTaskButton"
      class="bg-accent"
      on:click={() => (displayTaskEditor = true)}
    >
      +
    </button>
  </div>
{/if}

<style>
  #container {
    position: fixed;
    top: 50px;
    bottom: 60px;
    left: 0;
    right: 0;
    overflow-y: auto;
  }

  .center {
    max-width: 800px;
    margin: 0 auto;
  }

  /* bottom bar fixed at the bottom of the page after the tasks */
  #bottomBar {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* place the newTaskButton at the bottom center of the page */
  #newTaskButton {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 30px;
  }
</style>
