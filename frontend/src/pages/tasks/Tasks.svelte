<script lang="ts">
  import {
    pushWrapper as push,
    pushWrapper,
    replaceWrapper,
  } from "../../lib/navigatorWrapper";
  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("_id"); // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
  import { localTasksDb, logout } from "../../lib/couch";
  import {
    getUnassignedTasks,
    getUpcomingTasks,
    getCompletedTasks,
  } from "../../lib/tasks";

  // Types
  import type { Task } from "../../lib/actionListItem";

  // Components
  import TodayView from "./TodayView.svelte";
  import TaskList from "../../components/tasks/TaskList.svelte";
  import UpcomingView from "./UpcomingView.svelte";
  import AppBar from "../../components/TopBar.svelte";
  import AppBarItem from "../../components/BarItem.svelte";
  import TopBarTasksScopeSelector from "../../components/tasks/TopBarTasksScopeSelector.svelte";
  import DropdownMenu from "../../components/DropdownMenu.svelte";

  // Props
  export let params: { scope: string };
  export let menuItems;

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

  // Toggle between complete and incomplete
  function toggleComplete(task: Task) {
    localTasksDb.put({
      ...task,
    });
    displayedTasks = displayedTasks.filter((t) => t._id !== task._id);
  }

  function updateOrder(tasks: Task[]) {
    localTasksDb.bulkDocs(tasks);
  }

  // Listen to changes on the local database
  localTasksDb
    .changes({
      since: "now",
      live: true,
      include_docs: true,
    })
    .on("change", (change) => {
      // Redraw the UI
    });
</script>

<AppBar>
  <div slot="left">
    <AppBarItem><TopBarTasksScopeSelector /></AppBarItem>
  </div>
  <div slot="center" id="title">
    <AppBarItem><b>Oolong - Tasks</b></AppBarItem>
  </div>
  <div slot="right">
    <DropdownMenu {menuItems} />
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
    {:else if params.scope == "unassigned"}
      {#await getTasks(params.scope) then}
        <TaskList
          enableOrdering={true}
          tasks={displayedTasks}
          on:toggleComplete={(e) => toggleComplete(e.detail)}
          on:updateOrder={(e) => updateOrder(e.detail)}
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
    pushWrapper("/tasks/editor/-1");
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
    max-width: 800px;
    margin: auto;
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

  /* When wid is to small do not display #title */
  @media (max-width: 500px) {
    #title {
      display: none;
    }
  }
</style>
