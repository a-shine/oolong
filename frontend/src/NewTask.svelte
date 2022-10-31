<script lang="ts">
    import Modal from "./lib/Modal.svelte";
    import type { Task } from "./types/task.type";

    import { v4 as uuidv4 } from "uuid";

    export let displayNewTaskModal: boolean;
    export let saveTask: (task: Task) => void;

    let newTaskContent: string;
    let newTaskDate: string;
    let newTaskTime: string;

    function resetNewTask() {
        newTaskContent = undefined;
        newTaskDate = undefined;
        newTaskTime = undefined;
        displayNewTaskModal = false;
    }

    function createTask(): Task {
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
        const task: Task = {
            id: uuidv4(),
            projectId: null,
            content: newTaskContent,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            due: dueOn,
            withTime: newTaskTime ? true : false,
            reacurence: null,
            complete: false,
        };
        return task;
    }

    function newTask() {
        let newTask = createTask();
        saveTask(newTask);
        resetNewTask;
    }
</script>

<Modal on:close={() => (displayNewTaskModal = false)}>
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
