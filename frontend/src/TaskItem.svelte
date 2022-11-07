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

<input
    type="checkbox"
    bind:checked={task.complete}
    on:click={() => updateCompletionStatus(task)}
/>
<span on:click={() => (displayTaskEditorModal = true)} id="taskBody">
    <span>{task.content}</span>
    <br />
    {#if task.withTime}
        <span>{taskTime}</span>
    {/if}
</span>

{#if displayTaskEditorModal}
    <TaskEditor bind:displayTaskEditorModal {task} {saveTask} />
{/if}

<style>
    #taskBody:hover {
        background-color: gray;
    }
    /* .grid-container-element {
        display: grid;
        grid-template-columns: 4fr 1fr;
        border: 1px solid black;
    } */
</style>
