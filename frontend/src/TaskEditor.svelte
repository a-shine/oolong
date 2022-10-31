<script lang="ts">
    import Modal from "./lib/Modal.svelte";
    import type { Task } from "./types/task.type";

    export let displayTaskEditorModal: boolean;
    export let saveTask: (task: Task) => void;

    export let task: Task;

    let newTaskContent = task.content;
    let newTaskDate = new Date(task.due);
    let newTaskTime = new Date(task.due);

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
            }
        } else {
            dueOn = -1;
        }
        task.content = newTaskContent;
        task.due = dueOn;
    }

    function newTask() {
        updateTask();
        saveTask(task);
        resetNewTask;
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
