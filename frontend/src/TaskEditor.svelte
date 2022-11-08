<script lang="ts">
    import Modal from "./lib/Modal.svelte";
    import type { Task } from "./types/task.type";

    // BUG: Some fields from selected tasks are not copied to the editor

    export let displayTaskEditorModal: boolean;
    export let task: Task;
    export let saveTask: (task: Task) => void;
    export let updateDisplayedTasks: (task: Task) => void;

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
    }

    function newTask() {
        updateTask();
        saveTask(task);
        updateDisplayedTasks(task);
        resetNewTask();
    }
</script>

<Modal on:close={() => (displayTaskEditorModal = false)}>
    <form on:submit|preventDefault={newTask} autocomplete="off">
        <label for="task">Task</label>
        <input type="text" id="task" bind:value={newTaskContent} autofocus />
        <label for="dueOn">Due on</label>
        <input type="date" id="dueOn" bind:value={newTaskDate} />
        <label for="dueAt">At</label>
        <input type="time" id="dueAt" bind:value={newTaskTime} />
        <button type="submit">Add</button>
        <button type="button" on:click={resetNewTask}> Cancel</button>
    </form>
</Modal>
