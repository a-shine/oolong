<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import TaskList from "./TaskList.svelte";
  import type { Task } from "./types/task.type";

  export let db: PouchDB.Database<any>;
  export let overdueTasks: Task[] = [];

  const dispatch = createEventDispatcher();

  function toggleEdit(task: Task) {
    dispatch("toggleEdit", task);
  }

  function complete(task: Task) {
    dispatch("complete", task);
  }
</script>

{#if overdueTasks.length > 0}
  <p>Overdue</p>
  <TaskList
    enableOrdering={true}
    pdb={db}
    tasks={overdueTasks}
    on:toggleEdit={(e) => toggleEdit(e.detail)}
    on:toggleComplete={(e) => complete(e.detail)}
  />
{/if}
