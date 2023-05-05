<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { getToday, getTomorrow } from "./lib/date.utils";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import TaskList from "./TaskList.svelte";
  import CompletedTasksToday from "./CompletedTasksToday.svelte";
  import TodayOverdueTasks from "./TodayOverdueTasks.svelte";

  let showCompleted: boolean = false;

  let tasksToday: Task[] = [];
  let tasksOverdue: Task[] = [];
  let tasksDoneToday: Task[] = [];

  export let db: PouchDB.Database<Task>;

  // BUG: Not able to undo a task that was due today or overdue

  onMount(async () => {
    tasksToday = await getTodayIncompleteTasks();
    tasksToday = tasksToday.docs;
  });

  async function getTodayIncompleteTasks() {
    // const tx = (await db).transaction("incompleteTasks", "readwrite");
    // const store = tx.objectStore("incompleteTasks");
    // const index = store.index("dueOnListOrder");
    // let range;

    // let firstTaskToday = [getToday(), 0];
    // let firstTaskTmr = [getTomorrow(), 0];
    // range = IDBKeyRange.bound(firstTaskToday, firstTaskTmr, false, true);
    // return await index.getAll(range);
    return db.find({
      selector: {
        dueOn: { $eq: getToday() },
      },
      // sort: [{ listOrder: "asc" }],
    });
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
