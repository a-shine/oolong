<script lang="ts">
  import TaskList from "../../components/tasks/TaskList.svelte";
  import type { Task } from "../../types/task.type";

  // Create dispatch function
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let tasks: Task[];

  let sortedTasks: { date: string; tasks: Task[] }[];

  const getTaskDate = (task: Task) => {
    const date = new Date(task.dueOn);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Plot the tasks in blocks of the same date
  const plotTasks = () => {
    const tasksByDate = tasks.reduce((acc, task) => {
      const date = getTaskDate(task);
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
  }
  setSortTasks();
</script>

{#each sortedTasks as { date, tasks }}
  <h2>{date}</h2>
  <TaskList
    {tasks}
    on:toggleComplete={(e) => {
      // remove the task from the sublist of tasks for the date in sortedTasks
      let task = e.detail;
      let date = getTaskDate(task);
      // convert task date to dd/mm/yyyy format

      let index = sortedTasks.findIndex((task) => task.date === date);

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
