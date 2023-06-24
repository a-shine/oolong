<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getToday } from "../../lib/date.utils";

  // Types
  import type { Task } from "../../types/task.type";

  // Components
  import TaskList from "../../components/tasks/TaskList.svelte";
  import CompletedTasksToday from "../../components/tasks/CompletedTasksToday.svelte";

  // Props
  import { localTasksDb } from "../../lib/couch";

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
    const response = await localTasksDb.find({
      selector: {
        completedAt: { $eq: null }, // incomplete tasks
        listOrder: { $gte: 0 }, // starting at the first ordered task
        dueOn: { $lt: getToday(), $ne: "-1" }, // less than today and not unassigned
      },
      sort: [{ listOrder: "asc" }],
    });
    return response.docs;
  }

  async function getTodayIncompleteTasks() {
    const response = await localTasksDb.find({
      selector: {
        // IMPORTANT: the order of the fields in the selector matters!!!
        completedAt: { $eq: null }, // incomplete tasks
        listOrder: { $gte: 0 }, // starting at the first ordered task (task with the highest listOrder)
        dueOn: { $eq: getToday() }, // assigned today
      },
      sort: [{ listOrder: "asc" }],
    });
    return response.docs;
  }

  async function getTodayCompletedTasks() {
    const response = await localTasksDb.find({
      selector: {
        // Completed between 12:00am and 11:59pm in unix time
        completedAt: {
          $gte: Date.parse(getToday()),
          $lt: Date.parse(getToday()) + 86400000,
        },
      },
      sort: [{ completedAt: "desc" }],
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
    localTasksDb.put({
      ...task,
      // completedAt: null, // BUG: Put task completedAt update in the list component
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
    localTasksDb.put({
      ...task,
      // completedAt: Date.now(), // BUG: Put task completedAt update in the list component
    });
  }

  function updateOrder(tasks: Task[]) {
    console.log("updateOrder", tasks);
    localTasksDb.bulkDocs(tasks);
  }
</script>

{#if overdueTasks.length > 0}
  <p style="color:#FF0000">Overdue</p>
  <TaskList
    enableOrdering={true}
    tasks={overdueTasks}
    on:toggleComplete={(e) => complete(e.detail)}
    on:updateOrder={(e) => updateOrder(e.detail)}
  />
{/if}

{#if todayIncompleteTasks.length > 0}
  {#key todayIncompleteTasks}
    <p>Today</p>
    <TaskList
      enableOrdering={true}
      tasks={todayIncompleteTasks}
      on:toggleComplete={(e) => complete(e.detail)}
      on:updateOrder={(e) => updateOrder(e.detail)}
    />
  {/key}
{/if}

<CompletedTasksToday
  bind:todayCompletedTasks
  on:toggleEdit={(e) => toggleEdit(e.detail)}
  on:unComplete={(e) => unComplete(e.detail)}
/>
