export type Task = {
    id: string;
    projectLabel: string;
    description: string;
    createdAt: number;
    updatedAt: number;
    dueOn: number;
    dueAt: number;
    recurrence: number;
    state: string; // 'active' | 'in progress' | 'bug'/'feature' | 'completed' | 'archived'
    // A task list only capture the incomplete or completed states
    // A project Kanban board could capture the other states (any state other than 'completed' is considered incomplete)
    order: number;
    completedAt: number;
}

// Cannot use boolean as key/index in indexedDB (https://github.com/w3c/IndexedDB/issues/76)
// so we use 0 and 1 instead
