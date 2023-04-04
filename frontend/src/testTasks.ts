import type { Task } from "./types/task.type";

export let task1: Task = {
  id: "someRandomIdString1",
  projectLabel: null,
  description: "This task is overdue",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date("2021-01-01").setHours(0, 0, 0, 0),
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

export let task2: Task = {
  id: "someRandomIdString2",
  projectLabel: null,
  description: "This task is also overdue",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date("2021-01-01").setHours(0, 0, 0, 0),
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

export let task3: Task = {
  id: "someRandomIdString3",
  projectLabel: null,
  description: "This task is due today",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date().setHours(0, 0, 0, 0),
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

// task with no due date
export let task4: Task = {
  id: "someRandomIdString4",
  projectLabel: null,
  description: "This task is unassigned",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: -1,
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

export let task5: Task = {
  id: "someRandomIdString5",
  projectLabel: null,
  description: "This task is also unassigned",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: -1,
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

export let task6: Task = {
  id: "someRandomIdString6",
  projectLabel: null,
  description: "This task is upcoming",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date().setHours(0,0,0,0) + 86400000,
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

export let task7: Task = {
  id: "someRandomIdString7",
  projectLabel: null,
  description: "This task is done today",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date().setHours(0,0,0,0),
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: Date.now(),
};

export let task8: Task = {
  id: "someRandomIdString8",
  projectLabel: null,
  description: "This task is done today but was overdue",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date("2021-01-01").setHours(0, 0, 0, 0),
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: Date.now() + 5,
};