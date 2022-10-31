<script lang="ts">
    import Modal from "./lib/Modal.svelte";

    export let newTaskContent: string;
    export let newTaskDate: string;
    export let newTaskTime: string;
</script>

<Modal on:close={() => (displayTaskAdder = false)}>
    <form on:submit|preventDefault={submitTask} autocomplete="off">
        <label for="task">Task</label>
        <input type="text" id="task" bind:value={newTaskContent} autofocus />
        <label for="dueOn">Due on</label>
        <input type="date" id="dueOn" bind:value={newTaskDate} />
        <label for="dueAt">At</label>
        <input type="time" id="dueAt" bind:value={newTaskTime} />
        <button type="submit">Add</button>
        <button type="button" on:click={cancelNewTask}> Cancel</button>
    </form>
</Modal>
