<script lang="ts">
    import Modal from "./lib/Modal.svelte";
    import type { Task } from "./types/task.type";

    // TODO: Allow delete task when task is defined
    // TODO: Implement task deletion
    // BUG: Edge case of new tasks that have not been saved to the db yet
    // BUG: When saving pre-existing task it is re-added to the displayed tasts

    export let displayTaskEditorModal: boolean;
    export let task: Task;
    export let newTask: boolean;
    export let createTaskAndUpdateDisplay: (task: Task) => void;
    export let updateTaskAndUpdateDisplay: (task: Task) => void;
    export let deleteTaskAndUpdateDisplay: (task: Task) => void;
    // TODO: just bind the list of displayed tasks to the task editor and then it's easy to save, update, delete

    let addDate: boolean = false;
    let addTime: boolean = false;

    var today = new Date().toISOString().split("T")[0];

    let newTaskDate: string;
    let newTaskTime: string;

    let newTaskContent = task.content;
    if (task.due === undefined) {
        newTaskDate = "";
        newTaskTime = "";
    } else {
        newTaskDate = new Date(task.due).toISOString().split("T")[0];
        if (task.withTime) {
            newTaskTime = new Date(task.due).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    }

    function resetNewTask() {
        newTaskContent = undefined;
        newTaskDate = undefined;
        newTaskTime = undefined;
        displayTaskEditorModal = false;
    }

    // implement reactivity here so that it updates the tast reactively https://svelte.dev/tutorial/updating-arrays-and-objects
    function updateTask() {
        let dueOn;
        if (newTaskDate) {
            dueOn = new Date(newTaskDate).setHours(0, 0, 0, 0);
            if (newTaskTime) {
                let breakdown = newTaskTime.split(":");
                dueOn = new Date(newTaskDate).setHours(
                    breakdown[0],
                    breakdown[1],
                    0,
                    0
                );
                task.withTime = true;
            } else {
                task.withTime = false;
            }
        } else {
            dueOn = -1;
            task.withTime = false;
        }
        task.content = newTaskContent;
        task.due = dueOn;
        // TODO: Add task time logic here
        task = task; // add reactivity (BUG: have to do this on the displayed task list as well - that's what triggers the reactivity)
    }

    function deleteTask() {
        deleteTaskAndUpdateDisplay(task);
        resetNewTask();
    }

    function createTask() {
        updateTask();
        createTaskAndUpdateDisplay(task);
        resetNewTask();
    }

    function saveTask() {
        updateTask();
        updateTaskAndUpdateDisplay(task);
        resetNewTask();
    }

    let disableSaveButton: boolean = false;
    let disableDelButton: boolean = false;
    // if newTaskContent is empty, disable save button
    $: if (newTaskContent === undefined || newTaskContent === "") {
        disableSaveButton = true;
        disableDelButton = true;
    } else {
        disableSaveButton = false;
        disableDelButton = false;
    }

    function setToday() {
        addDate = true;
        newTaskDate = today;
    }

    // Listen for submit task on enter
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            if (newTask) {
                createTask();
                // close modal
            } else {
                saveTask();
                // close modal
            }
            displayTaskEditorModal = false;
        }
    }
</script>

<svelte:window on:keydown={handleKeyDown} />;

<Modal on:close={() => (displayTaskEditorModal = false)}>
    <!-- <form autocomplete="off"> -->
    <div style="width: 100%;">
        <input
            style="width: 100%;"
            type="text"
            id="task"
            bind:value={newTaskContent}
            autofocus
            placeholder="Task"
        />
    </div>

    <div>
        {#if !addDate}
            <button on:click={() => (addDate = !addDate)}>Add due date</button>
            (
            <button on:click={setToday}>Today</button>
            <button>Tomorrow</button>
            <button>This weekend</button>)
        {:else}
            <label for="date">Due on</label>
            <input type="date" id="date" bind:value={newTaskDate} min={today} />
            <button on:click={() => (addDate = !addDate)}
                >Remove due date</button
            >
        {/if}
    </div>

    <div>
        {#if !addTime}
            <button on:click={() => (addTime = !addTime)}>Add time due</button>
            (
            <button>Morning</button>
            <button>Afternoon</button>
            <button>Evening</button>)
        {:else}
            <label for="time">At</label>
            <input type="time" id="time" bind:value={newTaskTime} />
            <button on:click={() => (addTime = !addTime)}
                >Remove time due</button
            >
        {/if}
    </div>
    <!-- add time -->

    <!-- <label for="dueOn">Due on</label>
    <input type="date" id="dueOn" bind:value={newTaskDate} min={today} /> -->
    <!-- <label for="dueAt">At</label> -->
    <!-- <input type="time" id="dueAt" bind:value={newTaskTime} /> -->
    <!-- if newTask -->
    <div>
        {#if newTask}
            <button
                type="button"
                disabled={disableSaveButton}
                on:click={createTask}>Create</button
            >
        {:else}
            <button
                type="button"
                disabled={disableSaveButton}
                on:click={saveTask}>Save</button
            >
            <button type="button" on:click={deleteTask}>Delete</button>
        {/if}
        <button type="button" on:click={resetNewTask}> Cancel</button>
    </div>
</Modal>
