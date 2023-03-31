<script lang="ts">
  import type { Task } from "./types/task.type";
  import type { IDBPDatabase } from "idb";
  import TaskList from "./TaskList.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  let showCompleted: boolean = false;

  let tasksToday: Task[] = [];
  let tasksOverdue: Task[] = [];

  export let db: IDBPDatabase<unknown>;

  // BUG: Weird behaviour when re-ordering tasks (overdue tasks are not re-ordered)

  onMount(async () => {
    tasksToday = await getTodayIncompleteTasks();
    tasksOverdue = await getTasksOverdue();
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

  async function getTasksOverdue() {
    const tx = db.transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");

    let today = new Date().setHours(0, 0, 0, 0);
    // Get tasks that are not Unassigned but were due yesterday or before
    let range = IDBKeyRange.bound([-1, Infinity], [today, 0], false, false);
    return await index.getAll(range);
  }

  async function getTasksDoneToday() {
    const tx = db.transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed

    let today = new Date().setHours(0, 0, 0, 0);
    let range = IDBKeyRange.bound([-1, today], [Infinity, today], false, true);
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
    } else if (task.dueOn < new Date().setHours(0, 0, 0, 0)) {
      tasksOverdue = [...tasksOverdue, task];
    }
  }
</script>

{#if tasksOverdue.length > 0}
  {#key tasksOverdue}
    <p>Overdue</p>
    <TaskList
      enableOrdering={true}
      {db}
      tasks={tasksOverdue}
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
      tasks={tasksToday}
      on:toggleDone={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/key}
{/if}

{#await getTasksDoneToday()}
  <p>Loading...</p>
{:then tasks}
  {#if tasks.length > 0}
    <hr />
    <p>
      <button
        on:click={() => (showCompleted = !showCompleted)}
        class="borderless-button"
      >
        {showCompleted ? "Hide" : "Show"} today's completed tasks</button
      >
    </p>
    {#if showCompleted}
      <TaskList
        enableOrdering={false}
        {db}
        {tasks}
        on:toggleDone={(e) => toggleDone(e.detail)}
        on:toggleEdit={(e) => toggleEdit(e.detail)}
        on:undoneTask={(e) => unDone(e.detail)}
      />
    {/if}
  {/if}
{/await}
