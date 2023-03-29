<script lang="ts">
  import type { Task } from "./types/task.type";
  import type { IDBPDatabase } from "idb";
  import TaskItem from "./TaskItem.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  import { dndzone } from "svelte-dnd-action"; // https://github.com/isaacHagoel/svelte-dnd-action
  import { flip } from "svelte/animate";

  export let enableOrdering: boolean = false;
  export let db: IDBPDatabase<unknown>;
  export let scope: string;

  let tasks: Task[];

  onMount(async () => {
    tasks = await getTasks();
  });

  async function getTasks(): Promise<Task[]> {
    switch (scope) {
      case "today":
        return await getIncompleteTasksTimeline();
      case "completed":
        return await getCompletedTasks();
      default:
        return await getIncompleteTasksTimeline();
    }
  }

  async function getCompletedTasks(): Promise<Task[]> {
    const tx = db.transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed
    switch (scope) {
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        let range = IDBKeyRange.bound(
          [today, 0],
          [today + 86400000, Infinity],
          false,
          true
        );
        return await index.getAll(range);
      case "completed":
        return await index.getAll();
      default:
        return await index.getAll();
    }
  }

  async function getIncompleteTasksTimeline(): Promise<Task[]> {
    const tx = db.transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");
    let range;
    switch (scope) {
      case "unassigned":
        let firstUnassignedTask = [-1, 0];
        let lastUnassignedTask = [-1, Infinity];
        range = IDBKeyRange.bound(firstUnassignedTask, lastUnassignedTask);
        return await index.getAll(range);
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        let firstTaskToday = [today, 0];
        let firstTaskTmr = [today + 86400000, 0];
        range = IDBKeyRange.bound(firstTaskToday, firstTaskTmr, false, true);
        return await index.getAll(range);
      case "upcoming":
        let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound([tmr, 0]);
        return await index.getAll(range);
      default:
        return await index.getAll();
    }
  }

  async function completeTask(task: Task) {
    if (task.completedAt) {
      task.completedAt = null;
      (await db).put("incompleteTasks", task);
      (await db).delete("completedTasks", task.id);
    } else {
      task.completedAt = Date.now();
      (await db).put("completedTasks", task);
      (await db).delete("incompleteTasks", task.id);
    }

    // Refresh the displayed tasks based on the current scope
    // BUG: Task not re-appearing in todays list after being undone
    tasks = await getTasks();
    dispatch("undoneTask", task);
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
      (await db).put("incompleteTasks", tasks[i]);
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
    }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#each tasks as task (task.id)}
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
