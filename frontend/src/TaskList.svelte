<script lang="ts">
  import type { Task } from "./types/task.type";
  import TaskItem from "./TaskItem.svelte";
  import { createEventDispatcher } from "svelte";

  export let enableOrdering: boolean = false;
  export let tasks: Task[];

  // export let dbIndex;
  // export let range;

  async function getTasks() {
    return await dbIndex.getAll(range);
  }

  const dispatch = createEventDispatcher();

  // This determines what is seen in a a list so scope the db query to this

  function toggleDone(task: Task) {
    dispatch("toggleDone", task);
  }
</script>

<div id="task-list">
  {#each tasks as task}
    <TaskItem {task} on:toggleDone={(e) => toggleDone(e.detail)} />
  {/each}
</div>
