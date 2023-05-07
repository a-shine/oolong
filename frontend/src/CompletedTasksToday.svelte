<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TaskList from "./TaskList.svelte";

  // Props
  export let db: PouchDB.Database<any>;
  export let todayCompletedTasks: Task[] = [];

  const dispatch = createEventDispatcher();

  let showCompleted = false;

  function unComplete(task: Task) {
    dispatch("unComplete", task);
  }

  function toggleEdit(task: Task) {
    dispatch("toggleEdit", task);
  }
</script>

{#if todayCompletedTasks.length > 0}
  <p>
    <button
      on:click={() => (showCompleted = !showCompleted)}
      class="borderless-button"
    >
      {showCompleted ? "Hide" : "Show"} today's completed tasks</button
    >
  </p>
  {#if showCompleted}
    <hr />
    <TaskList
      enableOrdering={false}
      pdb={db}
      tasks={todayCompletedTasks}
      on:toggleComplete={(e) => unComplete(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/if}
{/if}
