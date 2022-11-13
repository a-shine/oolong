<script lang="ts">
    import type { Task } from "./types/task.type";

    import { v4 as uuidv4 } from "uuid";

    import TaskEditor from "./TaskEditor.svelte";

    export let displayTasksLenghth;
    export let displayTaskEditorModal: boolean;
    // export let saveTask: (task: Task) => void;
    // export let updateDisplayedTasks: (task: Task) => void;
    export let saveAndUpdateDisplay: (task: Task) => void;
    let task: Task;
    task = createTask();

    function deleteAndUpdateDisplay() {}

    function createTask(): Task {
        const task: Task = {
            id: uuidv4(),
            projectId: null,
            content: undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            due: undefined,
            withTime: undefined,
            reacurence: null,
            complete: false,
            index: displayTasksLenghth + 1,
        };
        return task;
    }
</script>

<TaskEditor
    bind:displayTaskEditorModal
    {task}
    {saveAndUpdateDisplay}
    {deleteAndUpdateDisplay}
/>
