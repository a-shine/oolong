import { localTasksDb } from "./couch";
import { getToday, getTomorrow } from "./date.utils";

/**
 * Get all unassigned tasks (tasks where dueOn is set to -1) from the local
 * (IndexedDB) tasks database.
 * @returns {Promise} A promise that resolves to an array of tasks
 */
export async function getUnassignedTasks(): Promise<any> {
  return localTasksDb.find({
    // Tasks that have not been completed and that are not associated with a duo
    // date (dueOn = -1).
    selector: {
      completedAt: {
        $eq: null,
      },
      listOrder: { $gte: 0 },
      dueOn: "-1",
    },
    // Order by listOrder
    sort: ["listOrder"],
  });
}

/**
 *
 * @returns {Promise} A promise that resolves to an array of tasks
 */
async function getOverdueTasks() {
  return localTasksDb.find({
    selector: {
      completedAt: { $eq: null }, // Incomplete tasks
      listOrder: { $gte: 0 }, // Starting at the first ordered task
      dueOn: { $lt: getToday(), $ne: "-1" }, // Less than today and not unassigned
    },
    // Order by listOrder (which encodes user-defined importance)
    sort: [{ listOrder: "asc" }],
  });
}
async function getTodayIncompleteTasks() {}
async function getTodayCompleteTasks() {}

/**
 * Get all upcoming tasks (tasks due from tomorrow onwards) from the local
 * (IndexedDB) database.
 * @returns {Promise} A promise that resolves to an array of tasks
 */
export async function getUpcomingTasks() {
  return localTasksDb.find({
    selector: {
      dueOn: {
        $gte: getTomorrow(),
      },
      completedAt: {
        $eq: null,
      },
    },
  });
}

/**
 * Get all completed tasks from the local (IndexedDB) database.
 * @returns {Promise} A promise that resolves to an array of tasks
 */
export async function getCompletedTasks() {
  return localTasksDb.find({
    selector: {
      // Tasks that have been completed (they have a non-null completedAt value)
      completedAt: { $gte: 0 },
    },
    // Order by completedAt descending (see most recent completed tasks first)
    sort: [{ completedAt: "desc" }],
  });
}
