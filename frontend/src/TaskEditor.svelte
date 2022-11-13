<script lang="ts">
    import Modal from "./lib/Modal.svelte";
    import type { Task } from "./types/task.type";

    // TODO: Allow delete task when task is defined
    // TODO: Implement task deletion
    // BUG: Edge case of new tasks that have not been saved to the db yet
    // BUG: When saving pre-existing task it is re-added to the displayed tasts

    export let displayTaskEditorModal: boolean;
    export let task: Task;
    export let saveAndUpdateDisplay: (task: Task) => void;
    export let deleteAndUpdateDisplay: (task: Task) => void;
    // TODO: just bind the list of displayed tasks to the task editor and then it's easy to save, update, delete
    // export let displayedTasks: Task[];

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
        deleteAndUpdateDisplay(task);
        resetNewTask();
    }

    function newTask() {
        updateTask();
        saveAndUpdateDisplay(task);
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
</script>

<Modal on:close={() => (displayTaskEditorModal = false)}>
    <form on:submit|preventDefault={newTask} autocomplete="off">
        <label for="task">Task</label>
        <input type="text" id="task" bind:value={newTaskContent} autofocus />
        <label for="dueOn">Due on</label>
        <input type="date" id="dueOn" bind:value={newTaskDate} min={today} />
        <label for="dueAt">At</label>
        <input type="time" id="dueAt" bind:value={newTaskTime} />
        <button type="submit" disabled={disableSaveButton}>Save</button>
        <button type="button" on:click={resetNewTask}> Cancel</button>
        <!-- if newTaskContent is not undefined show delete button -->
        <button
            type="button"
            on:click={deleteTask}
            disabled={disableDelButton}
            style="float: right;"
        >
            Delete</button
        >
    </form>
</Modal>
