<script lang="ts">
  import type { Task } from "./types/task.type";
  import TaskItem from "./TaskItem.svelte";
  import { createEventDispatcher } from "svelte";

  import { dndzone } from "svelte-dnd-action"; // https://github.com/isaacHagoel/svelte-dnd-action
  import { flip } from "svelte/animate";

  export let enableOrdering: boolean = false;
  export let tasks: Task[];

  // export let dbIndex;
  // export let range;

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
      (await db).put("incompleteTasks", tasks[i]);
    }
  }

  async function getTasks() {
    return await dbIndex.getAll(range);
  }

  const dispatch = createEventDispatcher();

  // This determines what is seen in a a list so scope the db query to this

  function toggleDone(task: Task) {
    dispatch("toggleDone", task);
  }

  function toggleEdit(task: Task) {
    dispatch("toggleEdit", task);
  }
</script>

<div id="task-list">
  {#each tasks as task}
    <TaskItem
      {task}
      on:toggleDone={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/each}
</div>
