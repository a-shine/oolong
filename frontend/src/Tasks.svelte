<script lang="ts">
  import { addTestTaskData } from "./lib/testTasks.utils";

  import type { Task } from "./types/task.type";

  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("_id"); // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";

  import { getToday, getTomorrow } from "./lib/date.utils";

  export let db: PouchDB.Database<{}>;

  // Displayed tasks are determined by the scope, on changes to scope, the task
  // list is updated
  let scope: string = "today";

  // The task that is currently being edited (undefined if no task is being
  // edited)
  // WARNING: It is important that this is undefined and not null as null is a value while undefined is not and so when setting the value to null you actually provide a value to the prop while with undefined you use the default value
  let taskCursor: Task = undefined;

  let displayTaskEditor: boolean = false;

  // addTestTaskData(pdb);

  /**
   * @returns a promise of the tasks list based on the component scope setting
   */
  async function getTasks(): Promise<Task[]> {
    switch (scope) {
      case "unassigned":
        return (await getUnassignedTasks()).docs;
      case "upcoming":
        return (await getUpcomingTasks()).docs;
      case "completed":
        return (await getCompletedTasks()).docs;
      default:
        return;
    }
  }

  /**
   * Get all unassigned tasks (tasks where dueOn is set to -1) from the local
   * (IndexedDB) database
   */
  async function getUnassignedTasks() {
    let jhg = db.find({
      selector: {
        dueOn: -1,
      },
    });

    return await jhg;
  }

  /**
   * Get all upcoming tasks (tasks due from tomorrow onwards) from the local
   * (IndexedDB) database
   */
  async function getUpcomingTasks() {
    let jgjg = db.find({
      selector: {
        dueOn: {
          $gte: getTomorrow(),
        },
      },
    });

    return await jgjg;
  }

  /**
   * Get all completed tasks from the local (IndexedDB) database
   */
  async function getCompletedTasks() {
    return await db.find({
      selector: {
        completedAt: {
          $gte: 0,
        },
      },
    });
  }

  /**
   * Open the task editor for the given task (by setting the taskCursor)
   */
  function editTask(task: Task) {
    taskCursor = task;
    displayTaskEditor = true;
  }

  async function deleteTask(task: Task) {
    db.remove(task);
  }

  async function putTask(task: Task) {
    console.log(db);
    db.put(task);
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
        putTask(e.detail);
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
      {#key scope}
        {#if scope == "today"}
          <TodayView {db} on:toggleEdit={(e) => editTask(e.detail)} />
        {:else}
          {#await getTasks() then tasks}
            <TaskList
              pdb={db}
              {tasks}
              on:toggleEdit={(e) => editTask(e.detail)}
            />
          {/await}
        {/if}
      {/key}
    </div>
  </div>

  <button
    id="newTaskButton"
    class="bg-accent"
    on:click={() => (displayTaskEditor = true)}
  >
    +
  </button>
{/if}

<style>
  #container {
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    overflow-y: auto;
  }

  .center {
    max-width: 800px;
    margin: 0 auto;
  }

  /* place the newTaskButton at the bottom center of the page */
  #newTaskButton {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    font-size: 50px;
    position: fixed;
    bottom: 0;
    margin-bottom: 20px;

    /* Move to the center by moving left and then translating from the center 
    point of the button right */
    left: 50%;
    transform: translateX(-50%);
    border: none;
  }
</style>
