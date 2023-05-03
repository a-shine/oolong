<script lang="ts">
  import { slide } from "svelte/transition";

  import { createEventDispatcher, onMount } from "svelte";
  import Dialog from "./lib/Dialog.svelte";
  import type { Task } from "./types/task.type";
  import { v4 as uuidv4 } from "uuid";

  // BUG: Fix so that keyboard doesn't add scroll to page on mobile
  // BUG: Unable to delete completed tasks from the TodayView

  // If no task is passed, it defaults to null
  export let task: Task = {
    _id: uuidv4(),
    description: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    dueOn: undefined,
    projectLabel: undefined,
    lane: undefined,
    laneOrder: undefined,
    listOrder: Infinity,
    dueAt: undefined,
    recurrence: undefined,
    completedAt: undefined,
  };

  // Component values binded to the task description and dueOn date inputs
  let descriptionValue: string;
  let dueOnValue: string;

  // Cache the initial task description and dueOn date so we can cancel the
  // changes if the user discards them
  let cachedDescription: string;
  let cachedDueOn: number;

  let safeCloseModal = false;
  let safeDeleteModal = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    // If task is null, we want to create a new task
    if (task.createdAt) {
      // If task is not a new task, we want to set the appropriate values
      dueOnValue = new Date(task.dueOn).toISOString().split("T")[0];
      descriptionValue = task.description;

      // BUG: these are not the same for some reason
      // console.log(dueOnValue);
      // console.log(new Date().toISOString().split("T")[0])

      cachedDescription = task.description;
      cachedDueOn = task.dueOn;
    }

    // Focus on the Task description input field
    const input = document.getElementById("task");
    input.focus();
  });

  function setTask() {
    // Set task description and dueOn date
    task.description = descriptionValue.trim();

    // BUG: Misinterpreting date format
    if (dueOnValue !== undefined) {
      console.log(dueOnValue);
      task.dueOn = new Date(dueOnValue).setHours(0, 0, 0, 0);
      console.log(new Date(task.dueOn).toISOString().split("T")[0]);
    } else {
      task.dueOn = -1;
    }

    task.updatedAt = new Date().getTime();
  }

  function createNewTask() {
    setTask();

    // Set the createdAt and updatedAt dates
    task.createdAt = new Date().getTime();

    // Dispatch the saveTask event to the parent component
    dispatch("saveTask", task);
  }

  const updateTask = () => {
    setTask();
    dispatch("saveTask", task);
  };

  const deleteTask = () => {
    dispatch("deleteTask", task);
  };

  const close = () => {
    dispatch("close");
  };

  let addDateDialog = false;

  function safeClose() {
    if (task.description === cachedDescription && task.dueOn === cachedDueOn) {
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

<div id="container">
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
      bind:value={descriptionValue}
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
          }}>Other datetime</button
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
    {#if task.createdAt}
      <button
        type="button"
        on:click={() => (safeDeleteModal = !safeDeleteModal)}>Delete</button
      >
      <button type="button" on:click={updateTask}>Save</button>
    {:else}
      <button type="button" id="task-add" on:click={createNewTask}>Add</button>
    {/if}
  </div>
</div>

<style>
  /* Container adding padding on the sides  */
  #container {
    padding: 0 1rem;
  }

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
