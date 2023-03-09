<script lang="ts">
    import { slide } from "svelte/transition";

    import { createEventDispatcher } from "svelte";
    import Modal from "./lib/Modal.svelte";

    const dispatch = createEventDispatcher();
    const close = () => dispatch("close");

    let taskContent: string;

    let safeExitModal = false;

    function newTask() {
        const task = document.getElementById("task") as HTMLInputElement;
        const taskText = task.value;
    }

    let addDateDialog = false;

    function safeClose() {
        if (taskContent === undefined || taskContent === "") {
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

<form id="task-editor" on:submit|preventDefault={newTask}>
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
        bind:value={taskContent}
    />
    <div id="task-params">
        {#if !addDateDialog}
            <button>Today</button>
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
    <button type="submit" id="task-add">Add</button>
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
