<script lang="ts">
    import TaskEditor from "./TaskEditor.svelte";
    import type { Task } from "./types/task.type";

    export let task: Task;
    export let saveTask: (task: Task) => void;

    let displayTaskEditorModal: boolean = false;

    let taskTime = new Date(task.due).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    function updateCompletionStatus(task: Task) {
        task.complete = !task.complete;
        saveTask(task);
    }
</script>

<div class="container">
    <input
        type="checkbox"
        bind:checked={task.complete}
        on:click={() => updateCompletionStatus(task)}
    />
    <div on:click={() => (displayTaskEditorModal = true)} id="taskBody">
        <span>{task.content}</span>
        <br />
        {#if task.withTime}
            <span><small>{taskTime}</small></span>
        {/if}
    </div>
</div>

{#if displayTaskEditorModal}
    <TaskEditor bind:displayTaskEditorModal {task} {saveTask} />
{/if}

<style>
    #taskBody {
        cursor: pointer;
        width: 100%;
    }
    #taskBody:hover {
        background-color: gray;
    }
    .container {
        display: flex;
        /* border: 1px solid black; */
        /* flex-direction: row; */
        /* align-items: center; */
    }
    /* .grid-container-element {
        display: grid;
        grid-template-columns: 4fr 1fr;
        border: 1px solid black;
    } */
</style>
