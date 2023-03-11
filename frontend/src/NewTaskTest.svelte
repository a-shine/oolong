<script lang="ts">
  import { slide } from "svelte/transition";

  import { createEventDispatcher } from "svelte";
  import Modal from "./lib/Modal.svelte";
  import type { Task } from "./types/task.type";
  import { v4 as uuidv4 } from "uuid";

  // If no task is passed, we will create a new one so we start with an undefined task
  export let task: Task;

  const dispatch = createEventDispatcher();

  const close = () => {
    dispatch("close");
  };

  const updateTask = () => {
    dispatch("updateTask", task);
  };

  const deleteTask = () => {
    dispatch("deleteTask", task);
  };

  let safeExitModal = false;

  let taskDueOn: Date;

  function createNewTask() {
    task.id = uuidv4();
    task.description = task.description.trim();
    task.createdAt = new Date().getTime();
    task.updatedAt = new Date().getTime();
    dispatch("newTask", task);
  }

  let addDateDialog = false;

  function safeClose() {
    if (task.description === "") {
      close();
    } else {
      safeExitModal = true;
    }
  }
</script>

{#if safeExitModal}
  <Modal>
    Are you sure you want to exit?
    <button
      on:click={() => {
        safeExitModal = false;
      }}>No</button
    >
    <button
      on:click={() => {
        safeExitModal = false;
        close();
      }}>Yes</button
    >
  </Modal>
{/if}

<form id="task-editor" on:submit|preventDefault={createNewTask}>
  <button
    type="button"
    id="task-cancel"
    on:click={() => {
      safeClose();
    }}>&#x2715;</button
  >
  <input
    type="text"
    id="task"
    name="task"
    placeholder="Task"
    autofocus
    autocomplete="off"
    bind:value={task.description}
  />
  <div id="task-params">
    {#if !addDateDialog}
      <button
        on:click={() => {
          taskDueOn = new Date().setHours(0, 0, 0, 0);
        }}>Today</button
      >
      <button>Tomorrow</button>
      <button
        on:click={() => {
          addDateDialog = true;
        }}>Other datetime</button
      >
    {:else}
      <!-- <div transition:slide>This is were you can add date info</div> -->
      <!-- This is were you can add date info -->
      <input transition:slide type="date" />
      <button
        on:click={() => {
          addDateDialog = false;
        }}>x</button
      >
    {/if}
  </div>
  {#if task.id}
    <button type="button" on:click={deleteTask}>Delete</button>
    <button type="button" on:click={updateTask}>Save</button>
  {:else}
    <button type="submit" id="task-add">Add</button>
  {/if}
</form>

<style>
  #task-editor {
    width: 100%;
    /* background-color: var(--base-100); */
    /* padding: 2rem 1rem; */
  }

  #task {
    width: 100%;
    height: 3.5rem;
    margin-bottom: 1rem;

    /* increase size of placeholder text proportionals */
    font-size: 1.5rem;
  }

  button {
    background: transparent;
    border: none;
  }

  /* darker background on hover */
  button:hover {
    background-color: var(--primary-color);
  }

  #task-add {
    float: right;
  }

  #task-cancel {
    float: right;
  }
</style>
