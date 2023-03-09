export type Task = {
    id: string;
    projectTag: string;
    description: string;
    createdAt: number;
    updatedAt: number;
    due: number; // string of the date/reminder
    withTime: boolean; // look at time as well as date
    recurrence: number;
    // Cannot use boolean as key/index in indexedDB (https://github.com/w3c/IndexedDB/issues/76)
    // so we use 0 and 1 instead
    complete: number;
    order: number;
}
