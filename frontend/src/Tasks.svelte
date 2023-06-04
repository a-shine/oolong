<script lang="ts">
  import { pushWrapper as push, replaceWrapper } from "./navigatorWrapper";
  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("_id"); // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
  import { getTomorrow } from "./lib/date.utils";
  import { userDb, logout } from "./couch";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TodayView from "./TodayView.svelte";
  import TaskList from "./lib/TaskList.svelte";
  import UpcomingView from "./UpcomingView.svelte";
  import AppBar from "./lib/AppBar.svelte";
  import AppBarItem from "./lib/AppBarItem.svelte";
  import TopBarTasksScopeSelector from "./lib/TopBarTasksScopeSelector.svelte";

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
        break;
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
        completedAt: { $gte: 0 },
      },
      sort: [{ completedAt: "desc" }],
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

<AppBar>
  <div slot="left">
    <AppBarItem><TopBarTasksScopeSelector /></AppBarItem>
  </div>
  <div slot="center">
    <AppBarItem><b>Oolong Tasks</b></AppBarItem>
  </div>
  <div slot="right">
    <AppBarItem
      ><button class="btn" on:click={logout}>Logout</button></AppBarItem
    >
  </div>
</AppBar>

<div id="container">
  <div id="tasks" class="center">
    {#if params.scope == "today"}
      <TodayView />
    {:else if params.scope == "upcoming"}
      {#await getTasks(params.scope) then}
        <UpcomingView
          tasks={displayedTasks}
          on:toggleComplete={(e) => toggleComplete(e.detail)}
        />
      {/await}
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
  on:click={() => {
    replaceWrapper("/tasks/editor/-1");
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
    height: 100%;
  }

  /* New task btn fixed horizontally centred at the bottom of the page */
  #newTaskButton {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 65px;
    height: 65px;
    border-radius: 50%;
    border: none;
    font-size: 2rem;
    font-weight: bold;
    z-index: 100;
  }
</style>
