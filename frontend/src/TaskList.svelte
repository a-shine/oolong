<script lang="ts">
  import type { Task } from "./types/task.type";
  import TaskItem from "./TaskItem.svelte";
  import { openDB } from "idb";

  export let enableOrdering: boolean = false;
  export let tasks: Task[];
  export const db = openDB("oolongDb", 1);
</script>

<div id="task-list">
  {#each tasks as task}
    <TaskItem {task} />
  {/each}
</div>
