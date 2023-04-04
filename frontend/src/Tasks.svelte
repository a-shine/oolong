<script lang="ts">
  import { openDB } from "idb";

  import type { Task } from "./types/task.type";

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";

  import {
    task1,
    task2,
    task3,
    task4,
    task5,
    task6,
    task7,
    task8,
  } from "./testTasks";


  let displayTaskEditor: boolean = false;

  // Displayed tasks are determined by the scope, on changes to scope, the task
  // list is updated
  let scope: string = "today";

  // TODO: Look at refactoring this approach to task creation and editing
  let taskCursor: Task = null;

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

        // Add some dummy data
        incompleteTasks.put(task1);
        incompleteTasks.put(task2);
        incompleteTasks.put(task3);
        incompleteTasks.put(task4);
        incompleteTasks.put(task5);
        incompleteTasks.put(task6);
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
        completedTasks.put(task7);
        completedTasks.put(task8);
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

  function editTask(task: Task) {
    displayTaskEditor = true;
    taskCursor = task; // overwrite the taskCursor with the task to edit
  }

  async function deleteTask(task: Task) {
    (await db).delete("incompleteTasks", task.id);
  }

  async function putTaskLocalDb(task: Task) {
    (await db).put("incompleteTasks", task);
  }
</script>

{#if displayTaskEditor}
  <div class="tasks">
    <TaskEditor
      task={taskCursor}
      on:close={() => {
        displayTaskEditor = false;
        taskCursor = null;
      }}
      on:saveTask={(e) => {
        putTaskLocalDb(e.detail);
        displayTaskEditor = false;
        taskCursor = null;
      }}
      on:deleteTask={(e) => {
        deleteTask(e.detail);
        displayTaskEditor = false;
        taskCursor = null;
      }}
    />
  </div>

  <!-- Show task list -->
{:else}
  <TasksTopBar bind:scope />

  <div id="container">
    <div id="tasks" class="tasks">
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

  .tasks {
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
