<script lang="ts">
  import type { Task } from "./types/task.type";
  import type { IDBPDatabase } from "idb";
  import TaskList from "./TaskList.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  let showCompleted: boolean = false;

  let tasksToday: Task[] = [];
  let tasksOverdue: Task[] = [];
  let tasksDoneToday: Task[] = [];

  export let db: IDBPDatabase<unknown>;

  // BUG: Not able to undo a task that was due today or overdue

  onMount(async () => {
    tasksToday = await getTodayIncompleteTasks();
    tasksOverdue = await getTasksOverdue();
    tasksDoneToday = await getTasksDoneToday();
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

  async function getTasksOverdue(): Promise<Task[]> {
    const tx = db.transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");

    let today = new Date().setHours(0, 0, 0, 0);
    // Get tasks that are not Unassigned but were due yesterday or before
    let range = IDBKeyRange.bound([-1, Infinity], [today, 0], false, true);
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


  // This determines what is seen in a a list so scope the db query to this

  

  const dispatch = createEventDispatcher();
  const toggleEdit = (task: Task) => dispatch("toggleEdit", task);

  async function unDone(task: Task) {
    console.log("unDone", task);
    if (task.dueOn === new Date().setHours(0, 0, 0, 0)) {
      console.log("here")
      tasksToday = [...tasksToday, task];
    } else if (task.dueOn < new Date().setHours(0, 0, 0, 0)) {
      tasksOverdue = [...tasksOverdue, task];
    }
  }

  function toggleDone(task: Task) {
    console.log("toggleDone", task);
    tasksDoneToday = [...tasksDoneToday, task];
    console.log("tasksDoneToday", tasksDoneToday);
  }
</script>

{#if tasksOverdue.length > 0}
  {#key tasksOverdue}
    <p>Overdue</p>
    <TaskList
      enableOrdering={true}
      {db}
      tasks={tasksOverdue}
      on:undoneTask={(e) => unDone(e.detail)}
      on:doneTask={(e) => toggleDone(e.detail)}
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
      on:undoneTask={(e) => unDone(e.detail)}
      on:doneTask={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/key}
{/if}

{#if tasksDoneToday.length > 0}
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
      tasks={tasksDoneToday}
      on:undoneTask={(e) => unDone(e.detail)}
      on:doneTask={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/if}
{/if}
