<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getToday } from "../../lib/date.utils";

  // Types
  import type { Task } from "../../lib/actionListItem";

  // Components
  import TaskList from "../../components/tasks/TaskList.svelte";
  import CompletedTasksToday from "../../components/tasks/CompletedTasksToday.svelte";

  // Props
  import { taskDb } from "../../lib/couch";
  export let workspaceId: string;

  const dispatch = createEventDispatcher();

  let overdueTasks: Task[] = [];
  let todayIncompleteTasks: Task[] = [];
  let todayCompletedTasks: Task[] = [];

  onMount(async () => {
    console.log(workspaceId);
    overdueTasks = await getOverdueTasks(workspaceId);
    todayIncompleteTasks = await getTodayIncompleteTasks(workspaceId);
    todayCompletedTasks = await getTodayCompletedTasks(workspaceId);
  });

  async function getOverdueTasks(workspaceId: string) {
    const response = await taskDb.find({
      selector: {
        workspaceId: { $eq: workspaceId },
        completedAt: { $eq: null }, // incomplete tasks
        listOrder: { $gte: 0 }, // starting at the first ordered task
        dueOn: { $lt: getToday(), $ne: "-1" }, // less than today and not unassigned
      },
      sort: [{ listOrder: "asc" }],
    });
    return response.docs;
  }

  async function getTodayIncompleteTasks(workspaceId: string) {
    const response = await taskDb.find({
      selector: {
        // IMPORTANT: the order of the fields in the selector matters!!!
        workspaceId: { $eq: workspaceId },
        completedAt: { $eq: null }, // incomplete tasks
        listOrder: { $gte: 0 }, // starting at the first ordered task (task with the highest listOrder)
        dueOn: { $eq: getToday() }, // assigned today
      },
      sort: [{ listOrder: "asc" }],
    });
    return response.docs;
  }

  async function getTodayCompletedTasks(workspaceId: string) {
    const response = await taskDb.find({
      selector: {
        // Completed between 12:00am and 11:59pm in unix time
        workspaceId: { $eq: workspaceId },
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
    taskDb.put({
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
    taskDb.put({
      ...task,
      // completedAt: Date.now(), // BUG: Put task completedAt update in the list component
    });
  }

  function updateOrder(tasks: Task[]) {
    console.log("updateOrder", tasks);
    taskDb.bulkDocs(tasks);
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
