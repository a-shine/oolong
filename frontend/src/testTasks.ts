import type { Task } from "./types/task.type";

let task1: Task = {
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

  let task6: Task = {
    id: "someRandomIdString1",
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

  let task2: Task = {
    id: "someRandomIdString2",
    projectLabel: null,
    description: "This task is due today",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dueOn: new Date().setHours(0, 0, 0, 0),
    dueAt: new Date().getTime(),
    recurrence: 0,
    lane: null,
    listOrder: 0,
    laneOrder: 0,
    completedAt: null,
  };

  // task with no due date
  let task3: Task = {
    id: "someRandomIdString3",
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

  let task4: Task = {
    id: "someRandomIdString4",
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

  let task5: Task = {
    id: "someRandomIdString5",
    projectLabel: null,
    description: "This task is upcoming",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dueOn: Date.now() + 86400000,
    dueAt: null,
    recurrence: 0,
    lane: null,
    listOrder: 0,
    laneOrder: 0,
    completedAt: null,
  };

  db.add("incompleteTasks", task1);
  db.add("incompleteTasks", task2);
  db.add("incompleteTasks", task3);
  db.add("incompleteTasks", task4);
  db.add("incompleteTasks", task5);
  db.add("incompleteTasks", task6);