<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getToday } from "./lib/date.utils";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TaskList from "./TaskList.svelte";
  import CompletedTasksToday from "./CompletedTasksToday.svelte";

  // Props
  export let pdb: PouchDB.Database<Task>;

  const dispatch = createEventDispatcher();

  let overdueTasks: Task[] = [];
  let todayIncompleteTasks: Task[] = [];
  let todayCompletedTasks: Task[] = [];

  onMount(async () => {
    overdueTasks = await getOverdueTasks();
    todayIncompleteTasks = await getTodayIncompleteTasks();
    todayCompletedTasks = await getTodayCompletedTasks();
  });

  async function getOverdueTasks() {
    let response = await pdb.find({
      selector: {
        dueOn: { $lt: getToday() },
        completedAt: { $eq: null },
      },
    });
    return response.docs;
  }

  async function getTodayIncompleteTasks() {
    const response = await pdb.find({
      selector: {
        dueOn: { $eq: getToday() },
        completedAt: { $eq: null },
      },
    });
    return response.docs;
  }

  async function getTodayCompletedTasks() {
    const response = await pdb.find({
      selector: {
        dueOn: { $eq: getToday() },
        completedAt: { $ne: null },
      },
    });
    return response.docs;
  }

  const toggleEdit = (task: Task) => dispatch("toggleEdit", task);

  function unComplete(task) {
    // Remove from completed tasks
    todayCompletedTasks = todayCompletedTasks.filter((t) => t._id !== task._id);

    const today = Date.parse(getToday());
    const taskDueOn = Date.parse(task.dueOn);
    if (taskDueOn < today) {
      overdueTasks = [...overdueTasks, task];
    } else {
      todayIncompleteTasks = [...todayIncompleteTasks, task];
    }
    pdb.put({
      ...task,
      completedAt: null, // BUG: Put task completedAt update in the list component
    });
  }

  function complete(task) {
    // Add to completed tasks
    todayCompletedTasks = [...todayCompletedTasks, task];

    const today = Date.parse(getToday());
    const taskDueOn = Date.parse(task.dueOn);
    if (taskDueOn < today) {
      overdueTasks = overdueTasks.filter((t) => t._id !== task._id);
    } else {
      todayIncompleteTasks = todayIncompleteTasks.filter(
        (t) => t._id !== task._id
      );
    }
    pdb.put({
      ...task,
      completedAt: Date.now(), // BUG: Put task completedAt update in the list component
    });
  }
</script>

{#if overdueTasks.length > 0}
  <p>Overdue</p>
  <TaskList
    enableOrdering={true}
    tasks={overdueTasks}
    on:toggleComplete={(e) => complete(e.detail)}
  />
{/if}

{#if todayIncompleteTasks.length > 0}
  {#key todayIncompleteTasks}
    <p>Today</p>
    <TaskList
      enableOrdering={true}
      tasks={todayIncompleteTasks}
      on:toggleComplete={(e) => complete(e.detail)}
      on:updateOrder={(e) => console.log("TODO: Update order", e.detail)}
    />
  {/key}
{/if}

<CompletedTasksToday
  bind:todayCompletedTasks
  on:toggleEdit={(e) => toggleEdit(e.detail)}
  on:unComplete={(e) => unComplete(e.detail)}
/>
