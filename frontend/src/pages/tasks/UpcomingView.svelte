<script lang="ts">
  import TaskList from "../../components/tasks/TaskList.svelte";
  import type { Task } from "../../types/task.type";

  // TODO: Make date human readable
  // BUG: Sort by date

  // Create dispatch function
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let tasks: Task[];

  let sortedTasks: { date: string; tasks: Task[] }[];

  function humanReadableDate(date: string) {
    const dateObj = new Date(date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return dateObj.toLocaleDateString("en-US", options);
  }

  // Plot the tasks in blocks of the same date
  const plotTasks = () => {
    const tasksByDate = tasks.reduce((acc, task) => {
      const date = task.dueOn;
      if (acc[date]) {
        acc[date].push(task);
      } else {
        acc[date] = [task];
      }
      return acc;
    }, {});

    const tasksByDateArray = Object.entries(tasksByDate);

    const tasksByDateArraySorted = tasksByDateArray.sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    return tasksByDateArraySorted.map(([date, tasks]) => {
      return {
        date,
        tasks,
      };
    });
  };

  function setSortTasks() {
    sortedTasks = plotTasks();
    console.log(sortedTasks);
  }
  setSortTasks();
</script>

{#each sortedTasks as { date, tasks }}
  <h2>{humanReadableDate(date)}</h2>
  <TaskList
    {tasks}
    on:toggleComplete={(e) => {
      // remove the task from the sublist of tasks for the date in sortedTasks
      let task = e.detail;

      let index = sortedTasks.findIndex((day) => day.date === task.dueOn);

      // remove the task from the sublist of tasks for the date in sortedTasks
      sortedTasks[index].tasks = sortedTasks[index].tasks.filter(
        (task) => task._id !== e.detail._id
      );

      // if no more tasks for the date, remove the date from sortedTasks
      if (sortedTasks[index].tasks.length === 0) {
        sortedTasks.splice(index, 1);
      }
      dispatch("toggleComplete", e.detail);
    }}
  />
{/each}
