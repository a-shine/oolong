<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { dndzone } from "svelte-dnd-action"; // https://github.com/isaacHagoel/svelte-dnd-action
  import { flip } from "svelte/animate";

  // Types
  import type { Task } from "../../types/task.type";

  //  Components
  import TaskItem from "./TaskItem.svelte";

  // Props
  export let enableOrdering: boolean = false;
  export let tasks: Task[];

  const dispatch = createEventDispatcher();

  const flipDurationMs = 100;

  /**
   * Handle the dnd:consider event (that is when the you are dragging an item
   * over the dropzone)
   * @param e (event)
   */
  function handleDndConsider(e) {
    tasks = e.detail.items;
    navigator.vibrate(5); // small vibration
  }

  /**
   * Handles the dnd:finalize event which is called when the user drops the
   * item. When the item is dropped we update the order of the tasks.
   * @param e
   */
  async function handleDndFinalize(e) {
    tasks = e.detail.items;
    // Update the order of the tasks
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].listOrder = i;
    }
    dispatch("updateOrder", tasks); // TODO: update order in db using bulkDocs
  }

  function dispatchToggleComplete(task: Task) {
    // TODO: update task in db
    dispatch("toggleComplete", task);
  }
</script>

{#if tasks}
  <div
    id="task-list"
    use:dndzone={{
      items: tasks,
      flipDurationMs,
      dragDisabled: !enableOrdering,
      dropFromOthersDisabled: true, // Prevent drag between Overdue and Today
    }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#each tasks as task (task._id)}
      <div animate:flip={{ duration: flipDurationMs }}>
        <TaskItem
          {task}
          on:toggleComplete={(e) => dispatchToggleComplete(e.detail)}
        />
      </div>
    {/each}
  </div>
{/if}
