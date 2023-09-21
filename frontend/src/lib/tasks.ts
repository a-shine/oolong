import {taskDb} from "./couch";
import {getToday, getTomorrow} from "./date.utils";


/**
 * Get all unassigned tasks (tasks where dueOn is set to -1) from the local
 * (IndexedDB) tasks database.
 * @returns {Promise} A promise that resolves to an array of tasks
 */
export async function getUnassignedTasks(workspaceId: string): Promise<any> {
    return taskDb.find({
        // Tasks that have not been completed and that are not associated with a duo
        // date (dueOn = -1).
        selector: {
            workspaceId: {$eq: workspaceId},
            completedAt: {$eq: null},
            listOrder: {$gte: 0},
            dueOn: {$eq: "-1"},
        },
        // Sort by listOrder (which encodes user-defined importance) and can be changed by drag and drop
        sort: ["listOrder"],
    });
}


/**
 * Get all upcoming tasks (tasks due from tomorrow onwards) from the local
 * (IndexedDB) database.
 * @returns {Promise} A promise that resolves to an array of tasks
 */
export async function getUpcomingTasks(workspaceId: string) {
    return taskDb.find({
        selector: {
            workspaceId: {$eq: workspaceId},
            dueOn: {$gte: getTomorrow()},
            completedAt: {$eq: null},
        },
    });
}

/**
 * Get all completed tasks from the local (IndexedDB) database.
 * @returns {Promise} A promise that resolves to an array of tasks
 */
export async function getCompletedTasks(workspaceId: string) {
    return taskDb.find({
        selector: {
            // Tasks that have been completed (they have a non-null completedAt value)
            workspaceId: {$eq: workspaceId},
            completedAt: {$gte: 0},
        }, // Order by completedAt descending (see most recent completed tasks first)
        sort: [{completedAt: "desc"}],
    });
}


/**
 * Get a task by its ID from the local (IndexedDB) database.
 * @param {string} id The ID of the task to get
 * @returns {Promise} A promise that resolves to a task
 * @throws {Error} If no task with the given ID exists
 */
export async function getTaskById(id: string) {
    return taskDb.get(id);
}

/**
 * Add a task to the local (IndexedDB) database.
 * @param {object} task The task to add
 * @returns {Promise} A promise that resolves to the task that was added
 * @throws {Error} If the task could not be added
 * @throws {Error} If the task is missing a description
 */
export async function addOrUpdateTask(task: any) {
    if (!task.description) {
        throw new Error("Task must have a description");
    }
    return taskDb.put(task);
}

/**
 * Delete a task from the local (IndexedDB) database.
 * @param {object} task The task to delete
 * @returns {Promise} A promise that resolves to the task that was deleted
 * @throws {Error} If the task could not be deleted
 */
export async function deleteTask(task: any) {
    return taskDb.remove(task);
}
