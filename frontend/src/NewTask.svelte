<script lang="ts">
    import type { Task } from "./types/task.type";

    import { v4 as uuidv4 } from "uuid";

    import TaskEditor from "./TaskEditor.svelte";

    export let displayTasksLenghth;
    export let displayTaskEditorModal: boolean;
    export let createTaskAndUpdateDisplay: (task: Task) => void;

    let task: Task;
    task = createTask();

    function updateTaskAndUpdateDisplay(task: Task) {}
    function deleteTaskAndUpdateDisplay() {}

    function createTask(): Task {
        const task: Task = {
            id: uuidv4(),
            projectId: null,
            content: undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            due: undefined,
            withTime: undefined,
            recurrence: null,
            complete: false,
            index: displayTasksLenghth + 1,
        };
        return task;
    }
</script>

<TaskEditor
    bind:displayTaskEditorModal
    {task}
    newTask={true}
    {createTaskAndUpdateDisplay}
    {updateTaskAndUpdateDisplay}
    {deleteTaskAndUpdateDisplay}
/>
