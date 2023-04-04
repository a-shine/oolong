export type Task = {
  id: string;
  projectLabel: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  dueOn: number;
  dueAt: number;
  recurrence: number;
  // Whether a task is completed is in a different table (if completed the state is set to null)
  lane: string; // 'active' | 'in progress' | 'bug'/'feature'
  // A task list only capture the incomplete or completed states
  // A project Kanban board could capture the other states (any state other than 'completed' is considered incomplete)
  listOrder: number;
  laneOrder: number;
  completedAt: number;
};

// add new constructor to Task class
// Path: frontend/src/models/task.model.ts

// Cannot use boolean as key/index in indexedDB (https://github.com/w3c/IndexedDB/issues/76)
// so we use 0 and 1 instead
