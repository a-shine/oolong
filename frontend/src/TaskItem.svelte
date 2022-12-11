<script lang="ts">
    // BUG: Aligning checkbox with text

    import TaskEditor from "./TaskEditor.svelte";
    import type { Task } from "./types/task.type";

    export let task: Task;
    export let updateTaskAndUpdateDisplay: (task: Task) => void;
    export let deleteTaskAndUpdateDisplay: (task: Task) => void;

    function createTaskAndUpdateDisplay(task: Task) {}

    let displayTaskEditorModal: boolean = false;

    function updateCompletionStatus(task: Task) {
        updateTaskAndUpdateDisplay(task);
    }
</script>

<div class="container">
    <input
        type="checkbox"
        bind:checked={task.complete}
        on:click={() => updateCompletionStatus(task)}
    />
    <!-- <div id="taskButton"> -->
    <div on:click={() => (displayTaskEditorModal = true)} id="taskBody">
        <span>{task.content}</span>

        <!-- if task with time compute the date in hh:mm format -->
        {#if task.withTime}
            <br />
            <span
                ><small
                    >{new Date(task.due).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</small
                ></span
            >
        {/if}
    </div>
    <!-- </div> -->
</div>

{#if displayTaskEditorModal}
    <TaskEditor
        bind:displayTaskEditorModal
        {task}
        newTask={false}
        {createTaskAndUpdateDisplay}
        {updateTaskAndUpdateDisplay}
        {deleteTaskAndUpdateDisplay}
    />
{/if}

<style>
    /* constant height */
    .container {
        height: 3em;
        border: 1px solid black;
    }

    #taskBody {
        cursor: pointer;
        /* text-align: left; */
        width: 100%;
        /* height: 100%; */
        /* BUG: make height static */
        margin: auto; /*used to vertical align content within */
    }
    #taskButton {
        cursor: pointer;
        width: 100%;
        height: 100%;
    }
    .container:hover {
        background-color: gray;
    }
    .container {
        display: flex;
        align-items: center;
        /* border: 1px solid black; */
        /* flex-direction: row; */
        /* align-items: center; */
    }
    /* .grid-container-element {
        display: grid;
        grid-template-columns: 4fr 1fr;
        border: 1px solid black;
    } */

    /* flat square checkbox */
    input[type="checkbox"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 1px solid black;
        /* border-radius: 3px; */
        background-clip: padding-box;
        background-color: white;
        vertical-align: middle;
        cursor: pointer;
        /* vertical-align: middle; */
    }

    input[type="checkbox"]:checked {
        background-color: black;
    }

    /* BUG: Is this necessary? */
    /* align checkbox with text */
    input[type="checkbox"] {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
</style>
