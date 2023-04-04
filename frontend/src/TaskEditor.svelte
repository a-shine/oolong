<script lang="ts">
  import { slide } from "svelte/transition";

  import { createEventDispatcher, onMount } from "svelte";
  import Dialog from "./lib/Dialog.svelte";
  import type { Task } from "./types/task.type";
  import { v4 as uuidv4 } from "uuid";

  // If no task is passed, we will create a new one so we start with an undefined task
  export let task: Task;

  let safeCloseModal = false;
  let safeDeleteModal = false;

  let dueOnString: string;

  // BUG: fix so that keyboard doesn't add scroll to page on mobile

  // BUG: changing due on button not removing active on other button

  // cache the initial task description and dueOn date
  let cachedTaskDescription: string = task.description;
  let cachedTaskDueOn: number = task.dueOn;

  const dispatch = createEventDispatcher();

  onMount(() => {
    // Focus on the input field
    const input = document.getElementById("task");
    input.focus();
  });

  const close = () => {
    dispatch("close");
  };

  const updateTask = () => {
    task.updatedAt = new Date().getTime();
    if (dueOnString) {
      task.dueOn = new Date(dueOnString).getTime();
    }
    dispatch("updateTask", task);
  };

  const deleteTask = () => {
    dispatch("deleteTask", task);
  };

  function createNewTask() {
    task.id = uuidv4();
    task.description = task.description.trim();
    task.createdAt = new Date().getTime();
    task.updatedAt = new Date().getTime();
    if (dueOnString) {
      task.dueOn = new Date(dueOnString).setHours(0, 0, 0, 0);
    }

    dispatch("newTask", task);
  }

  let addDateDialog = false;

  function safeClose() {
    if (
      task.description === cachedTaskDescription &&
      task.dueOn === cachedTaskDueOn
    ) {
      close();
    } else {
      safeCloseModal = true;
    }
  }
</script>

{#if safeCloseModal}
  <Dialog>
    Are you sure you want to exit?
    <button
      on:click={() => {
        safeCloseModal = false;
      }}>No</button
    >
    <button
      on:click={() => {
        safeCloseModal = false;
        close();
      }}>Yes</button
    >
  </Dialog>
{/if}

{#if safeDeleteModal}
  <Dialog>
    Are you sure you want to delete?
    <button
      on:click={() => {
        safeDeleteModal = false;
      }}>No</button
    >
    <button
      on:click={() => {
        safeDeleteModal = false;
        deleteTask();
        close();
      }}>Yes</button
    >
  </Dialog>
{/if}

<div id="topBar">
  <button
    type="button"
    id="close"
    on:click={() => {
      safeClose();
    }}>&#x2715;</button
  >
</div>
<div id="taskForm">
  <input
    type="text"
    id="task"
    name="task"
    placeholder="Task"
    autocomplete="off"
    bind:value={task.description}
  />

  <!-- BUG: Changing from Today to Tmr or vice versa both buttons stay active -->
  <div id="task-params">
    {#if !addDateDialog}
      <button
        class:active={task.dueOn === new Date().setHours(0, 0, 0, 0) ||
          dueOnString === new Date().toISOString().split("T")[0]}
        on:click={(e) => {
          dueOnString = new Date().toISOString().split("T")[0];
        }}>Today</button
      >
      <button
        class:active={task.dueOn ===
          new Date(new Date().getTime() + 86400000).setHours(0, 0, 0, 0) ||
          dueOnString ===
            new Date(new Date().getTime() + 86400000)
              .toISOString()
              .split("T")[0]}
        on:click={() => {
          dueOnString = new Date(new Date().getTime() + 86400000)
            .toISOString()
            .split("T")[0];
        }}>Tomorrow</button
      >
      <button
        on:click={() => {
          addDateDialog = true;
        }}>Other datetime</button
      >
      <!-- remove date button -->
      {#if dueOnString || task.dueOn}
        <button
          on:click={() => {
            dueOnString = undefined;
            task.dueOn = -1;
          }}>x</button
        >
      {/if}
    {:else}
      <input in:slide type="date" bind:value={dueOnString} />
      <button
        on:click={() => {
          addDateDialog = false;
        }}>x</button
      >
    {/if}
  </div>
  {#if task.id}
    <button type="button" on:click={() => (safeDeleteModal = !safeDeleteModal)}
      >Delete</button
    >
    <button type="button" on:click={updateTask}>Save</button>
  {:else}
    <button type="button" id="task-add" on:click={createNewTask}>Add</button>
  {/if}
</div>

<style>
  #topBar {
    width: 100%;
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .active {
    background-color: var(--primary-color);
  }

  #task {
    width: 100%;
    height: 3.5rem;
    margin-bottom: 1rem;

    /* increase size of placeholder text proportionals */
    font-size: 1.5rem;
  }

  /* darker background on hover */
  button:hover {
    background-color: var(--primary-color);
  }

  #task-add {
    float: right;
  }
</style>
