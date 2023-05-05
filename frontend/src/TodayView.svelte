<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getToday, getTomorrow } from "./lib/date.utils";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TaskList from "./TaskList.svelte";
  import CompletedTasksToday from "./CompletedTasksToday.svelte";
  import TodayOverdueTasks from "./TodayOverdueTasks.svelte";

  let tasksToday: Task[] = [];
  let tasksOverdue: Task[] = [];
  let tasksDoneToday: Task[] = [];

  export let db: PouchDB.Database<Task>;

  // BUG: Not able to undo a task that was due today or overdue

  onMount(async () => {
    tasksToday = await getTodayIncompleteTasks();
  });

  async function getTodayIncompleteTasks() {
    const response = await db.find({
      selector: {
        dueOn: { $eq: getToday() },
        completedAt: { $eq: null },
      },
      // sort: [{ listOrder: "asc" }],
    });
    return response.docs;
  }

  // This determines what is seen in a a list so scope the db query to this

  const dispatch = createEventDispatcher();
  const toggleEdit = (task: Task) => dispatch("toggleEdit", task);

  async function unDone(task: Task) {
    console.log("unDone", task);
    if (task.dueOn === getToday()) {
      console.log("here");
      tasksToday = [...tasksToday, task];
    } else if (task.dueOn < getToday()) {
      tasksOverdue = [...tasksOverdue, task];
    }
  }

  function toggleDone(task: Task) {
    console.log("toggleDone", task);
    tasksDoneToday = [...tasksDoneToday, task];
    console.log("tasksDoneToday", tasksDoneToday);
  }
</script>

<TodayOverdueTasks {db} />

{#if tasksToday.length > 0}
  {#key tasksToday}
    <p>Today</p>
    <TaskList
      enableOrdering={true}
      pdb={db}
      tasks={tasksToday}
      on:undoneTask={(e) => unDone(e.detail)}
      on:doneTask={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/key}
{/if}

<CompletedTasksToday {db} />
