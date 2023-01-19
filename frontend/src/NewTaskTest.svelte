<script lang="ts">
    import { slide } from "svelte/transition";

    function newTask() {
        const task = document.getElementById("task") as HTMLInputElement;
        const taskText = task.value;
    }

    let addDateDialog = false;
</script>

<form id="task-editor" on:submit|preventDefault={newTask}>
    <input
        type="text"
        id="task"
        name="task"
        placeholder="Task"
        autofocus
        autocomplete="off"
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
</style>
