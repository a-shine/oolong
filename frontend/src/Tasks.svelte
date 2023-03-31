<script lang="ts">
  import { openDB } from "idb";

  import type { Task } from "./types/task.type";

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";

  // TODO: Clean and refactor this file

  let displayTaskEditorDialog: boolean = false;

  // Displayed tasks are determined by the scope, on changes to scope, the task
  // list is updated
  let scope: string = "today";

  // TODO: Look at refactoring this approach to task creation and editing
  let taskCursor: Task = newBlankTaskObj();

  // Open a connection to the local (IndexedDB) database. Create/modify the
  // necessary object stores if the version has changed.
  const db = openDB("oolongDb", 1, {
    upgrade(db) {
      console.log("Upgrading database...");
      // Creating two object stores. One for incomplete tasks and the other for
      // completed tasks.
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
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed

    return await index.getAll();
  }

  async function getUpcomingTasks() {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");

    let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
    let range = IDBKeyRange.lowerBound([tmr, 0]);
    return await index.getAll(range);
  }

  async function getUnassignedTasks(): Promise<Task[]> {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");

    let firstUnassignedTask = [-1, 0];
    let lastUnassignedTask = [-1, Infinity];
    let range = IDBKeyRange.bound(firstUnassignedTask, lastUnassignedTask);
    return await index.getAll(range);
  }

  function newBlankTaskObj(): Task {
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

  function editTask(task: Task) {
    displayTaskEditorDialog = true;
    taskCursor = task; // overwrite the taskCursor with the task to edit
  }

  async function deleteTask(task: Task) {
    (await db).delete("incompleteTasks", task.id);
  }

  async function addTaskToLocalDb(task: Task) {
    (await db).put("incompleteTasks", task);
  }
</script>

{#if displayTaskEditorDialog}
  <div class="tasks">
    <TaskEditor
      task={taskCursor}
      on:close={() => {
        displayTaskEditorDialog = false;
        taskCursor = newBlankTaskObj();
      }}
      on:newTask={(e) => {
        addTaskToLocalDb(e.detail);
        taskCursor = newBlankTaskObj();
        displayTaskEditorDialog = false;
      }}
      on:updateTask={(e) => {
        addTaskToLocalDb(e.detail);
        taskCursor = newBlankTaskObj();
        displayTaskEditorDialog = false;
      }}
      on:deleteTask={(e) => {
        deleteTask(e.detail);
        taskCursor = newBlankTaskObj();
        displayTaskEditorDialog = false;
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
                enableOrdering={false}
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
      on:click={() => (displayTaskEditorDialog = true)}
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
