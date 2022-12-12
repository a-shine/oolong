<script lang="ts">
    import TaskEditor from "./TaskEditor.svelte";
    import type { Task } from "./types/task.type";

    export let task: Task;
    export let updateTaskAndUpdateDisplay: (task: Task) => void;
    export let deleteTaskAndUpdateDisplay: (task: Task) => void;

    function createTaskAndUpdateDisplay(task: Task) {}

    let displayTaskEditorModal: boolean = false;

    function updateCompletionStatus(task: Task) {
        task.complete = !task.complete;
        updateTaskAndUpdateDisplay(task);
    }
</script>

<div class="container" on:click|self={() => (displayTaskEditorModal = true)}>
    <input
        type="checkbox"
        bind:checked={task.complete}
        on:click={() => updateCompletionStatus(task)}
    />
    <!-- <div id="taskButton"> -->
    <div id="taskBody" on:click={() => (displayTaskEditorModal = true)}>
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
        display: flex;
        align-items: center;
        height: 3em;
        border: 1px solid black;
        cursor: pointer;
    }

    #taskBody {
        cursor: pointer;
        width: 100%;
    }
    #taskButton {
        cursor: pointer;
        width: 100%;
        height: 100%;
    }
    .container:hover {
        background-color: gray;
    }
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
</style>
