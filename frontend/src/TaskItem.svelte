<script lang="ts">
    import type { Task } from "./types/task.type";

    export let task: Task;
    export let saveCompleteStatus: (task: Task) => void;

    let taskTime = new Date(task.due).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    function editTask() {
        console.log("here");
    }
</script>

<div class="grid-container-element">
    <div on:click={editTask} id="taskBody">
        <span>{task.content}</span>
        <br />
        {#if task.withTime}
            <span>{taskTime}</span>
        {/if}
    </div>
    <div>
        <input
            type="checkbox"
            bind:checked={task.complete}
            on:click={() => saveCompleteStatus(task)}
        />
    </div>
</div>

<style>
    #taskBody:hover {
        background-color: gray;
    }
    .grid-container-element {
        display: grid;
        grid-template-columns: 90% 10%;
        /* grid-gap: 20px; */
        border: 1px solid black;
        /* width: 50%; */
    }
</style>
