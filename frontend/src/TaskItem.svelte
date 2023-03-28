<script lang="ts">
  import type { Task } from "./types/task.type";
  import { createEventDispatcher } from "svelte";

  //  TODO: Toggle uncomplete tasks

  export let task: Task;

  const dispatch = createEventDispatcher();

  function toggleDone() {
    dispatch("toggleDone", task);
  }

  function toggleEdit() {
    dispatch("toggleEdit", task);
  }
</script>

<div id="task-item">
  <div id="done-checkbox">
    <input
      type="checkbox"
      id="task-checkbox"
      name="task-checkbox"
      on:click={toggleDone}
      bind:checked={task.completedAt}
    />
  </div>
  <div id="task-info" on:click={toggleEdit}>
    <div id="task-text">
      {task.description}
    </div>
    <div id="task-details">
      {#if task.dueAt}
        <span class="detail-tag"
          >{new Date(task.dueAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</span
        >
      {/if}
    </div>
  </div>
</div>

<style>
  #task-item {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
  }

  #done-checkbox {
    margin-right: 5px;
  }

  /* Fill the remaining space of the task-item */
  #task-info {
    width: 100%;
    overflow: hidden;
  }

  /* Fill remaining width of task-item */
  #task-text {
    width: 100%;

    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Little coloured tag with rounded edges */
  #task-details {
    width: 100%;
  }

  .detail-tag {
    /* small text */
    font-size: 0.7rem;

    margin-right: 2.5px;
    padding: 1px 2.5px;

    border-radius: 5px;
    background-color: var(--accent);
  }
</style>
