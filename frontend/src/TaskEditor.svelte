<script lang="ts">
  import { slide } from "svelte/transition";
  import { v4 as uuidv4 } from "uuid";
  import { userDb } from "./couch";
  import { fly } from "svelte/transition";

  // Types
  import type { Task } from "./types/task.type";

  // Components
  import Modal from "./lib/Modal.svelte";
  import { replaceWrapper } from "./navigatorWrapper";

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

  let safeCloseModal = false;
  let safeDeleteModal = false;

  async function getTask() {
    if (params.taskId == "-1") {
      // If no task is passed, it defaults to null
      task = {
        _id: uuidv4(),
        _rev: undefined,
        description: undefined,
        notes: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        dueOn: undefined,
        projectTag: undefined,
        lane: undefined,
        laneOrder: undefined,
        listOrder: Infinity,
        dueAt: undefined,
        recurrence: undefined,
        completedAt: undefined,
      };
    } else {
      task = await userDb.get(params.taskId);
    }

    // If task is null, we want to create a new task
    if (task.createdAt) {
      // If task is not a new task, we want to set the appropriate values
      if (task.dueOn !== "-1") {
        dueOnValue = new Date(task.dueOn).toISOString().split("T")[0];
      }
      descriptionValue = task.description;
      notesValue = task.notes;

      cachedDescription = task.description;
      cachedDueOn = task.dueOn;
      cachedNotes = task.notes;
    }
  }

  function setTask() {
    // Set task description and dueOn date
    task.description = descriptionValue.trim();
    task.notes = notesValue;

    // If we've specified a date, then assign the date to the task
    // Else, undefined tasks have a dueOn of -1 so they are still present in the Index
    if (dueOnValue !== undefined) {
      task.dueOn = dueOnValue;
    } else {
      task.dueOn = "-1";
    }

    task.updatedAt = new Date().getTime();
    task.completedAt = null;
  }

  function createNewTask() {
    setTask();

    // Set the createdAt and updatedAt dates
    task.createdAt = new Date().getTime();

    userDb.put(task);
    replaceWrapper("/tasks");
  }

  const updateTask = () => {
    setTask();
    userDb.put(task);
    replaceWrapper("/tasks");
  };

  const deleteTask = () => {
    userDb.remove(task);
    replaceWrapper("/tasks");
  };

  let addDateDialog = false;

  function safeClose() {
    if (task.description === cachedDescription && task.dueOn === cachedDueOn) {
      replaceWrapper("/tasks");
    } else {
      safeCloseModal = true;
    }
  }
</script>

{#if safeCloseModal}
  <Modal>
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
  </Modal>
{/if}

{#if safeDeleteModal}
  <Modal>
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
  </Modal>
{/if}

<div id="container" class="center" in:fly={{ y: 200, duration: 250 }}>
  {#await getTask() then}
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
      {#if task.createdAt}
        <button
          type="button"
          on:click={() => (safeDeleteModal = !safeDeleteModal)}>Delete</button
        >
        <button type="button" on:click={updateTask}>Save</button>
      {:else}
        <button type="button" id="task-add" on:click={createNewTask}>Add</button
        >
      {/if}
      <button on:click={safeClose}>Cancel</button>
    </div>
  {/await}
</div>

<style>
  /* Container adding padding on the sides  */
  #container {
    padding: 0 1rem;
    margin-top: 10px;
  }

  .active {
    background-color: var(--primary-btn);
  }

  #task {
    width: 100%;
    height: 3.5rem;
    /* margin-bottom: 1rem; */

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
    height: 1px;
    background-color: var(--primary-btn);
    margin: 1rem 0;
  }

  #task-add {
    float: right;
  }
</style>
