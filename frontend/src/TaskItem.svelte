<script lang="ts">
    import type { Task } from "./types/task.type";

    export let task: Task;

    let taskTime = new Date(task.due).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
</script>

<div>
    <span>{task.content}</span>
    <input
        type="checkbox"
        bind:checked={task.complete}
        on:click={() => toggleComplete(task)}
    /><br />
    {#if task.withTime}
        <span>{taskTime}</span>
    {/if}
</div>
