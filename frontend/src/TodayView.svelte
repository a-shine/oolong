<script lang="ts">
  import type { Task } from "./types/task.type";
  import type { IDBPDatabase } from "idb";
  import TaskList from "./TaskList.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  let showCompleted: boolean = false;

  let tasksToday: Task[] = [];
  let tasksOverdue: Task[] = [];

  export let db: IDBPDatabase<unknown>;

  onMount(async () => {
    tasksToday = await getTodayIncompleteTasks();
    tasksOverdue = await getOverdueTasks();
  });

  async function getTodayIncompleteTasks() {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");
    let range;

    let today = new Date().setHours(0, 0, 0, 0);
    let firstTaskToday = [today, 0];
    let firstTaskTmr = [today + 86400000, 0];
    range = IDBKeyRange.bound(firstTaskToday, firstTaskTmr, false, true);
    return await index.getAll(range);
  }

  async function getOverdueTasks() {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");
    let range;

    let today = new Date().setHours(0, 0, 0, 0);
    let firstTaskToday = [today, 0];
    range = IDBKeyRange.upperBound(firstTaskToday);
    return await index.getAll(range);
  }

  // BUG: Not showing only today's completed tasks - LOGIC IS WRONG don't look at dueOn but look at completedAt (we care about showing tasks completed today)
  // TODO: When displaying completed tasks, show the most recently completed tasks first
  async function getTodayCompletedTasks() {
    const tx = (await db).transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed

    let today = new Date().setHours(0, 0, 0, 0);
    let range = IDBKeyRange.bound(
      [today, 0],
      [today + 86400000, Infinity],
      false,
      true
    );
    return await index.getAll(range);
  }

  const dispatch = createEventDispatcher();

  // This determines what is seen in a a list so scope the db query to this

  function toggleDone(task: Task) {
    dispatch("toggleDone", task);
  }

  function toggleEdit(task: Task) {
    dispatch("toggleEdit", task);
  }

  function unDone(task: Task) {
    if (task.dueOn === new Date().setHours(0, 0, 0, 0)) {
      tasksToday = [...tasksToday, task];
    } else {
      tasksOverdue = [...tasksOverdue, task];
    }
  }
</script>

<!-- TODO: Test undone re-added to list -->
{#if tasksOverdue.length > 0}
  {#key tasksOverdue}
    <p>Overdue</p>
    <TaskList
      enableOrdering={true}
      {db}
      scope="overdue"
      on:toggleDone={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/key}
{/if}
{#if tasksToday.length > 0}
  {#key tasksToday}
    <p>Today</p>
    <TaskList
      enableOrdering={true}
      {db}
      scope="today"
      on:toggleDone={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/key}
{/if}

<hr />
<p>
  <button
    on:click={() => (showCompleted = !showCompleted)}
    class="borderless-button"
  >
    {showCompleted ? "Hide" : "Show"} completed tasks</button
  >
</p>
{#if showCompleted}
  {#await getTodayCompletedTasks()}
    <p>Loading...</p>
  {:then tasks}
    {#each tasks as task}
      <TaskList
        enableOrdering={false}
        {db}
        scope="completed"
        on:toggleDone={(e) => toggleDone(e.detail)}
        on:toggleEdit={(e) => toggleEdit(e.detail)}
        on:undoneTask={(e) => unDone(e.detail)}
      />
    {/each}
  {/await}
{/if}
