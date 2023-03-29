<script lang="ts">
  import { openDB } from "idb";

  import type { Task } from "./types/task.type";

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";

  let displayTaskEditorDialog: boolean = false;

  // Displayed tasks are determined by the scope, on changes to scope, the task
  // list is updated
  let scope: string = "today";

  let taskCursor: Task = newBlankTaskObj();

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
  <!-- Show task list -->
{:else}
  <TasksTopBar bind:scope />

  <div id="container">
    <div id="tasks">
      {#await db}
        <div>Loading...</div>
      {:then db}
        {#key scope}
          {#if scope == "today"}
            <TodayView {db} on:toggleEdit={(e) => editTask(e.detail)} />
          {:else}
            <TaskList
              enableOrdering={false}
              {db}
              {scope}
              on:toggleEdit={(e) => editTask(e.detail)}
            />
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

  #tasks {
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
