<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { slide, fly } from "svelte/transition";

  import { Task } from "../../lib/actionListItem";
  import { getTaskById, addOrUpdateTask, deleteTask } from "../../lib/tasks";

  // Components
  import Dialog from "../../components/Dialog.svelte";
  import { popWrapper } from "../../lib/navigatorWrapper";

  // Props
  export let params: { taskId: string };

  let task: Task;

  // BUG: Fix so that keyboard doesn't add scroll to page on mobile

  // Component values bind-ed to the task description and dueOn date inputs
  let descriptionValue: string;
  let notesValue: string;
  let dueOnValue: string;

  // Cache the initial task description and dueOn date so we can cancel the
  // changes if the user discards them
  let cachedDescription: string;
  let cachedNotes: string;
  let cachedDueOn: string;

  let safeCloseDialog;
  let safeDeleteDialog;
  let addDateDialog = false;

  /**
   * Get or create the Task object and assign it to the component task variable
   */
  async function getOrCreateTask() {
    if (params.taskId == "-1") {
      // If no task is passed, it defaults to null
      task = new Task();
    } else {
      task = await getTaskById(params.taskId);
    }
  }

  const updateTask = () => {
    task.description = descriptionValue.trim();
    task.notes = notesValue;

    // If we've specified a date, then assign the date to the task
    // Else, undefined tasks have a dueOn of -1 so they are still present in the
    // IndexedDB database
    if (dueOnValue !== undefined) {
      task.dueOn = dueOnValue;
    } else {
      task.dueOn = "-1";
    }

    task.updatedAt = new Date().getTime();

    addOrUpdateTask(task);
    popWrapper();
  };

  function safeClose() {
    if (
      task.description === cachedDescription ||
      task.dueOn === cachedDueOn ||
      task.notes === cachedNotes
    ) {
      popWrapper();
    } else {
      safeCloseDialog.showModal();
    }
  }

  onMount(async () => {
    // Get or create the task object
    await getOrCreateTask();

    // Set task value in the editor
    descriptionValue = task.description;
    notesValue = task.notes;
    if (task.dueOn !== "-1") {
      dueOnValue = new Date(task.dueOn).toISOString().split("T")[0];
    }

    cachedDescription = task.description;
    cachedNotes = task.notes;
    cachedDueOn = task.dueOn;
  });
</script>

<Dialog bind:dialog={safeCloseDialog} on:close={() => console.log("closed")}>
  <p>Are you sure you want to exit?</p>
  <button
    on:click={() => {
      safeCloseDialog.close();
    }}>No</button
  >
  <button
    on:click={() => {
      safeCloseDialog.close();
      popWrapper();
    }}>Yes</button
  >
</Dialog>

<Dialog bind:dialog={safeDeleteDialog} on:close={() => console.log("closed")}>
  Are you sure you want to delete?
  <button
    on:click={() => {
      safeDeleteDialog.close();
    }}>No</button
  >
  <button
    on:click={() => {
      safeDeleteDialog.close();
      deleteTask(task);
      popWrapper();
    }}>Yes</button
  >
</Dialog>

<div id="container" class="center" in:fly={{ y: 200, duration: 250 }}>
  {#await getOrCreateTask() then}
    <div id="taskForm">
      <input
        type="text"
        id="task"
        name="task"
        placeholder="Task"
        autocomplete="off"
        bind:value={descriptionValue}
        autofocus
      />

      <textarea
        name=""
        id="noteInput"
        cols="30"
        rows="10"
        placeholder="Add notes..."
        bind:value={notesValue}
      />
      <div id="task-params">
        {#if !addDateDialog}
          <button
            class:active={dueOnValue === new Date().toISOString().split("T")[0]}
            on:click={(e) => {
              dueOnValue = new Date().toISOString().split("T")[0];
            }}>Today</button
          >
          <button
            class:active={dueOnValue ===
              new Date(new Date().getTime() + 86400000)
                .toISOString()
                .split("T")[0]}
            on:click={() => {
              dueOnValue = new Date(new Date().getTime() + 86400000)
                .toISOString()
                .split("T")[0];
            }}>Tomorrow</button
          >
          <button
            on:click={() => {
              addDateDialog = true;
            }}>Another day...</button
          >
          <!-- remove date button -->
          {#if dueOnValue !== undefined}
            <button
              on:click={() => {
                dueOnValue = undefined;
              }}>x</button
            >
          {/if}
        {:else}
          <input in:slide type="date" bind:value={dueOnValue} />
          <button
            on:click={() => {
              addDateDialog = false;
            }}>x</button
          >
        {/if}
      </div>
      <div id="separator" />
      {#if params.taskId !== "-1"}
        <button type="button" on:click={() => safeDeleteDialog.showModal()}
          >Delete</button
        >
        <button type="button" on:click={updateTask}>Save</button>
      {:else}
        <button type="button" id="task-add" on:click={updateTask}>Add</button>
      {/if}
      <button on:click={safeClose}>Cancel</button>
    </div>
  {/await}
</div>

<style>
  /* Container adding padding on the sides  */
  #container {
    padding: 0 1rem;
    /* position: fixed; */
  }

  .active {
    background-color: var(--primary-focus-color);
  }

  #task {
    width: 100%;
    height: 3.5rem;
    border: none;

    /* increase size of placeholder text proportionals */
    font-size: 1.5rem;
  }

  #noteInput {
    width: 100%;
    height: 5rem;
    border: none;
    resize: none;
  }

  #noteInput:focus {
    outline: none;
  }

  #separator {
    width: 100%;
    margin: 1rem 0;
  }

  #task-add {
    float: right;
  }
</style>
