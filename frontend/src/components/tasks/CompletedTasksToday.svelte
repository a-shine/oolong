<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // Types
  import type { Task } from "../../lib/actionListItem";

  // Components
  import TaskList from "./TaskList.svelte";

  // Props
  export let todayCompletedTasks: Task[] = [];

  const dispatch = createEventDispatcher();

  let showCompleted = false;

  function unComplete(task: Task) {
    dispatch("unComplete", task);
  }
</script>

{#if todayCompletedTasks.length > 0}
  <p>
    <button
      on:click={() => (showCompleted = !showCompleted)}
      id="toggleCompletedTasks"
      class="secondary-button"
    >
      {showCompleted ? "Hide" : "Show"} today's completed tasks</button
    >
  </p>
  {#if showCompleted}
    <hr />
    <TaskList
      enableOrdering={false}
      tasks={todayCompletedTasks}
      on:toggleComplete={(e) => unComplete(e.detail)}
    />
  {/if}
{/if}

<style>
    #toggleCompletedTasks {
    /*   center button */
    display: block;
    margin: 0 auto;

    }
</style>