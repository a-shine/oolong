<script lang="ts">
  import type { Task } from "./types/task.type";
  import TaskItem from "./TaskItem.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  import { dndzone } from "svelte-dnd-action"; // https://github.com/isaacHagoel/svelte-dnd-action
  import { overrideItemIdKeyNameBeforeInitialisingDndZones } from "svelte-dnd-action";
  overrideItemIdKeyNameBeforeInitialisingDndZones("_id"); // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
  import { flip } from "svelte/animate";

  export let enableOrdering: boolean = false;
  export let pdb: PouchDB.Database<Task>;

  export let tasks: Task[];

  // BUG: this logic is conflicting with the logic in TodayView.svelte
  async function completeTask(task: Task) {
    if (task.completedAt) {
      task.completedAt = null;
      pdb.put(task);
      dispatch("undoneTask", task);
    } else {
      task.completedAt = Date.now();
      pdb.put(task);
      dispatch("doneTask", task);
    }

    // Refresh the displayed tasks based on the current scope

    // BUG: When task is moved back to original list, error is thrown
    // Remove the task from the list
    tasks = tasks.filter((t) => t._id !== task._id);
  }

  const flipDurationMs = 100;

  function handleDndConsider(e) {
    tasks = e.detail.items;
    // small vibration
    navigator.vibrate(5);
  }
  async function handleDndFinalize(e) {
    tasks = e.detail.items;
    // update the order of the tasks
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].listOrder = i;
      pdb.put(tasks[i]);
      // (await db).put("incompleteTasks", tasks[i]);
    }
  }

  const dispatch = createEventDispatcher();

  // This determines what is seen in a a list so scope the db query to this

  function toggleEdit(task: Task) {
    dispatch("toggleEdit", task);
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
          on:toggleDone={(e) => completeTask(e.detail)}
          on:toggleEdit={(e) => toggleEdit(e.detail)}
        />
      </div>
    {/each}
  </div>
{/if}
