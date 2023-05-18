<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { push } from "svelte-spa-router";

  // Types
  import type { Task } from "./types/task.type";

  // Props
  export let task: Task;

  const dispatch = createEventDispatcher();
</script>

<div id="task-item">
  <div id="done-checkbox">
    <input
      type="checkbox"
      id="task-checkbox"
      name="task-checkbox"
      on:click={() => {
        task.completedAt = task.completedAt ? null : Date.now();
        dispatch("toggleComplete", task);
      }}
      bind:checked={task.completedAt}
    />
  </div>
  <div id="task-info" on:click={() => push("/tasks/editor/" + task._id)}>
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
