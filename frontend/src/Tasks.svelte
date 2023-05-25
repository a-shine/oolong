<script lang="ts">
  import { push } from "svelte-spa-router";
  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("_id"); // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
  import { getTomorrow } from "./lib/date.utils";
  import { userDb } from "./couch";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";
  import UpcomingView from "./UpcomingView.svelte";

  // Props
  export let params: { scope: string };

  // Displayed tasks are determined by the scope, on changes to scope, the task
  // list is updated
  let displayedTasks: Task[];

  /**
   * @returns a promise of the tasks list based on the component scope setting
   */
  async function getTasks(scope: string) {
    switch (scope) {
      case "unassigned":
        displayedTasks = (await getUnassignedTasks()).docs;
        break;
      case "upcoming":
        displayedTasks = (await getUpcomingTasks()).docs;
        break;
      case "completed":
        displayedTasks = (await getCompletedTasks()).docs;
        break;
      default:
        console.log("Incorrect task retrieval scope");
      // break;
    }
  }

  /**
   * Get all unassigned tasks (tasks where dueOn is set to -1) from the local
   * (IndexedDB) database
   */
  async function getUnassignedTasks() {
    let jhg = userDb.find({
      selector: {
        dueOn: "-1",
        completedAt: {
          $eq: null,
        },
        // listOrder: { $gte: 0 },
      },
      // sort: ["listOrder"],
      // sort by listOrder
    });

    return await jhg;
  }

  /**
   * Get all upcoming tasks (tasks due from tomorrow onwards) from the local
   * (IndexedDB) database
   */
  async function getUpcomingTasks() {
    let jgjg = userDb.find({
      selector: {
        dueOn: {
          $gte: getTomorrow(),
        },
        completedAt: {
          $eq: null,
        },
      },
    });

    return await jgjg;
  }

  /**
   * Get all completed tasks from the local (IndexedDB) database
   */
  async function getCompletedTasks() {
    return await userDb.find({
      selector: {
        completedAt: {
          $gte: 0,
        },
      },
    });
  }

  // Toggle between complete and incomplete
  function toggleComplete(task: Task) {
    userDb.put({
      ...task,
    });
    displayedTasks = displayedTasks.filter((t) => t._id !== task._id);
  }

  function updateOrder(tasks: Task[]) {
    userDb.bulkDocs(tasks);
  }
</script>

<div id="container">
  <div id="tasks" class="center">
    {#if params.scope == "today"}
      <TodayView />
      <!-- {:else if params.scope == "upcoming"}
      {#await getTasks(params.scope) then}
        <UpcomingView tasks={displayedTasks} />
      {/await} -->
    {:else}
      {#await getTasks(params.scope) then}
        <TaskList
          enableOrdering={false}
          tasks={displayedTasks}
          on:toggleComplete={(e) => toggleComplete(e.detail)}
          on:updateOrder={(e) => updateOrder(e.detail)}
        />
      {/await}
    {/if}
  </div>
</div>

<button
  id="newTaskButton"
  class="bg-accent"
  on:click={() => {
    push("/tasks/editor/-1");
  }}
>
  +
</button>

<style>
  #container {
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    overflow-y: auto;
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
    -webkit-appearance: none;
  }
</style>
