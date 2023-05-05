<script lang="ts">
  import { onMount } from "svelte";
  import TaskList from "./TaskList.svelte";
  import { getToday } from "./lib/date.utils";

  export let db: PouchDB.Database<any>;

  let showCompleted = false;

  async function getTasksDoneToday() {
    const response = await db.find({
      selector: {
        dueOn: { $eq: getToday() },
      },
      // sort: [{ completedAt: "desc" }],
    });
    return response.docs;
  }
</script>

{#await getTasksDoneToday() then DoneTasks}
  {#if DoneTasks.length > 0}
    <p>
      <button
        on:click={() => (showCompleted = !showCompleted)}
        class="borderless-button"
      >
        {showCompleted ? "Hide" : "Show"} today's completed tasks</button
      >
    </p>
    {#if showCompleted}
      <hr />
      <TaskList
        enableOrdering={false}
        pdb={db}
        tasks={DoneTasks}
        on:undoneTask={(e) => unDone(e.detail)}
        on:doneTask={(e) => toggleDone(e.detail)}
        on:toggleEdit={(e) => toggleEdit(e.detail)}
      />
    {/if}
  {/if}
{/await}
