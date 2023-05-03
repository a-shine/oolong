import type { Task } from "../types/task.type";

// pouchdb type
import type { PouchDB } from "pouchdb-browser";
import { v4 as uuidv4 } from "uuid";

let task1: Task = {
  _id: uuidv4(),
  _rev: null,
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

let task2: Task = {
  _id: uuidv4(),
  _rev: null,
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

let task3: Task = {
  _id: uuidv4(),
  _rev: null,
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
let task4: Task = {
  _id: uuidv4(),
  _rev: null,
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

let task5: Task = {
  _id: uuidv4(),
  _rev: null,
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

let task6: Task = {
  _id: uuidv4(),
  _rev: null,
  projectLabel: null,
  description: "This task is upcoming",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date().setHours(0, 0, 0, 0) + 86400000,
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: null,
};

let task7: Task = {
  _id: uuidv4(),
  _rev: null,
  projectLabel: null,
  description: "This task is done today",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueOn: new Date().setHours(0, 0, 0, 0),
  dueAt: null,
  recurrence: 0,
  lane: null,
  listOrder: 0,
  laneOrder: 0,
  completedAt: Date.now(),
};

let task8: Task = {
  _id: uuidv4(),
  _rev: null,
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

export function addTestTaskData(db: PouchDB.Database<Task>) {
  db.put(task1);
  db.put(task2);
  db.put(task3);
  db.put(task4);
  db.put(task5);
  db.put(task6);
  db.put(task7);
  db.put(task8);
}
