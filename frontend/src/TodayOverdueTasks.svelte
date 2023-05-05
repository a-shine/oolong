<script lang="ts">
  import TaskList from "./TaskList.svelte";
  import { getToday } from "./lib/date.utils";

  export let db: PouchDB.Database<any>;

  async function getTasksOverdue() {
    let response = await db.find({
      selector: {
        dueOn: { $lt: getToday(), $gt: "-1" },
      },
      // sort: [{ listOrder: "asc" }],
    });
    return response.docs;
  }
</script>

{#await getTasksOverdue() then overdueTasks}
  {#if overdueTasks.length > 0}
    <p>Overdue</p>
    <TaskList
      enableOrdering={true}
      pdb={db}
      tasks={overdueTasks}
      on:undoneTask={(e) => unDone(e.detail)}
      on:doneTask={(e) => toggleDone(e.detail)}
      on:toggleEdit={(e) => toggleEdit(e.detail)}
    />
  {/if}
{/await}
