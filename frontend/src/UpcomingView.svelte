<script lang="ts">
  import TaskList from "./TaskList.svelte";
  import type { Task } from "./types/task.type";

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
</script>

{#each plotTasks() as { date, tasks }}
  <h2>{date}</h2>
  <TaskList {tasks} />
{/each}
