<script lang="ts">
  import type { Task } from "./types/task.type";
  import type { IDBPDatabase } from "idb";
  import TaskList from "./TaskList.svelte";
  import { createEventDispatcher } from "svelte";

  let showCompleted: boolean = false;

  export let db: IDBPDatabase<unknown>;

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
</script>

{#await getOverdueTasks()}
  <p>Loading...</p>
{:then tasks}
  {#if tasks.length > 0}
    <p>Overdue</p>
    <TaskList
      enableOrdering={true}
      {tasks}
      on:toggleDone={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/if}
{/await}
{#await getTodayIncompleteTasks()}
  <p>Loading...</p>
{:then tasks}
  {#if tasks.length > 0}
    <p>Today</p>
    <TaskList
      enableOrdering={true}
      {tasks}
      on:toggleDone={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/if}
{/await}

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
        {tasks}
        on:toggleDone={(e) => toggleDone(e.detail)}
        on:toggleEdit={(e) => toggleEdit(e.detail)}
      />
    {/each}
  {/await}
{/if}
