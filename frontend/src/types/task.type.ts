export type Task = {
    id: string;
    projectTag: string;
    description: string;
    createdAt: number;
    updatedAt: number;
    dueOn: number; // string of the date/reminder
    // withTime: boolean; // look at time as well as date
    dueAt: number;
    recurrence: number;
    // Cannot use boolean as key/index in indexedDB (https://github.com/w3c/IndexedDB/issues/76)
    // so we use 0 and 1 instead
    order: number;
}
