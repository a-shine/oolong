<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getToday } from "./lib/date.utils";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TaskList from "./TaskList.svelte";
  import CompletedTasksToday from "./CompletedTasksToday.svelte";
  import TodayOverdueTasks from "./TodayOverdueTasks.svelte";

  // Props
  export let db: PouchDB.Database<Task>;

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
    let response = await db.find({
      selector: {
        dueOn: { $lt: getToday(), $ne: "-1" },
      },
      sort: [{ dueOn: "desc" }],
    });
    return response.docs;
  }

  async function getTodayIncompleteTasks() {
    const response = await db.find({
      selector: {
        dueOn: { $eq: getToday() },
        completedAt: { $eq: null },
      },
    });
    return response.docs;
  }

  async function getTodayCompletedTasks() {
    const response = await db.find({
      selector: {
        dueOn: { $eq: getToday() },
        completedAt: { $ne: null },
      },
      // sort: [{ completedAt: "desc" }],
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
  }
</script>

<TodayOverdueTasks
  {db}
  bind:overdueTasks
  on:toggleEdit={(e) => toggleEdit(e.detail)}
  on:complete={(e) => complete(e.detail)}
/>

{#if todayIncompleteTasks.length > 0}
  {#key todayIncompleteTasks}
    <p>Today</p>
    <TaskList
      enableOrdering={true}
      pdb={db}
      tasks={todayIncompleteTasks}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
      on:toggleComplete={(e) => complete(e.detail)}
    />
  {/key}
{/if}

<CompletedTasksToday
  {db}
  bind:todayCompletedTasks
  on:toggleEdit={(e) => toggleEdit(e.detail)}
  on:unComplete={(e) => unComplete(e.detail)}
/>
