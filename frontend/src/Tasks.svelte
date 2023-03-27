<script lang="ts">
  import { openDB } from "idb";
  import { dndzone } from "svelte-dnd-action"; // https://github.com/isaacHagoel/svelte-dnd-action
  import { flip } from "svelte/animate";

  import type { Task } from "./types/task.type";

  import TasksTopBar from "./TasksTopBar.svelte";
  import TaskEditor from "./TaskEditor.svelte";
  import TaskItem from "./TaskItem.svelte";
  import TodayView from "./TodayView.svelte";
  import TaskList from "./TaskList.svelte";

  let displayTaskEditorDialog: boolean = false;

  let tasks: Task[] = [];

  // Displayed tasks are determined by the scope
  let scope: string = "today";

  let dragDisabled = true;

  let disabledScroll = true;

  // TODO: clean and comment
  // BUG: Disable scrolling on mobile when keyboard is open

  // Get the database promise and create the object stores if required
  const db = openDB("oolongDb", 1, {
    upgrade(db) {
      console.log("Upgrading database...");
      if (!db.objectStoreNames.contains("incompleteTasks")) {
        const incompleteTasks = db.createObjectStore("incompleteTasks", {
          keyPath: "id",
        });
        incompleteTasks.createIndex("dueOnListOrder", ["dueOn", "listOrder"], {
          unique: false,
        });
        incompleteTasks.createIndex(
          "projectLabelLaneLaneOrder",
          ["projectLabel", "lane", "laneOrder"],
          {
            unique: false,
          }
        );
      }
      if (!db.objectStoreNames.contains("completedTasks")) {
        const completedTasks = db.createObjectStore("completedTasks", {
          keyPath: "id",
        });
        completedTasks.createIndex(
          "dueOnCompletedAt",
          ["dueOn", "completedAt"],
          {
            unique: false,
          }
        );
      }
    },
  });

  async function getCompletedTasks(scope: string): Promise<Task[]> {
    const tx = (await db).transaction("completedTasks", "readwrite");
    const store = tx.objectStore("completedTasks");
    const index = store.index("dueOnCompletedAt"); // return completed task in order of the most recently completed
    switch (scope) {
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        let range = IDBKeyRange.bound(
          [today, 0],
          [today + 86400000, Infinity],
          false,
          true
        );
        return await index.getAll(range);
      case "completed":
        return await index.getAll();
      default:
        return await index.getAll();
    }
  }

  async function getIncompleteTasksTimeline(scope: string) {
    const tx = (await db).transaction("incompleteTasks", "readwrite");
    const store = tx.objectStore("incompleteTasks");
    const index = store.index("dueOnListOrder");
    let range;
    switch (scope) {
      case "unassigned":
        let firstUnassignedTask = [-1, 0];
        let lastUnassignedTask = [-1, Infinity];
        range = IDBKeyRange.bound(firstUnassignedTask, lastUnassignedTask);
        return await index.getAll(range);
      case "today":
        let today = new Date().setHours(0, 0, 0, 0);
        let firstTaskToday = [today, 0];
        let firstTaskTmr = [today + 86400000, 0];
        range = IDBKeyRange.bound(firstTaskToday, firstTaskTmr, false, true);
        return await index.getAll(range);
      case "upcoming":
        let tmr = new Date().setHours(0, 0, 0, 0) + 86400000;
        range = IDBKeyRange.lowerBound([tmr, 0]);
        return await index.getAll(range);
      default:
        return await index.getAll();
    }
  }

  const flipDurationMs = 100;
  function handleDndConsider(e) {
    tasks = e.detail.items;
    // small vibration
    navigator.vibrate(5);
  }
  async function handleDndFinalize(e) {
    tasks = e.detail.items;
    // update the order of the tasks
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].listOrder = i;
      (await db).put("incompleteTasks", tasks[i]);
    }
  }

  async function addTaskToLocalDb(task: Task) {
    (await db).put("incompleteTasks", task);
    // Refresh the displayed tasks based on the current scope
    tasks = await getIncompleteTasksTimeline(scope);
  }

  function newBlankTaskObj(): Task {
    return {
      id: undefined,
      projectLabel: null,
      description: "",
      createdAt: undefined,
      updatedAt: undefined,
      dueOn: -1, // by default no due date
      dueAt: null,
      recurrence: 0,
      lane: null,
      listOrder: Infinity,
      laneOrder: Infinity,
      completedAt: undefined,
    };
  }

  let taskCursor: Task = newBlankTaskObj();

  function editTask(task: Task) {
    displayTaskEditorDialog = true;
    taskCursor = task; // overwrite the taskCursor with the task to edit
  }
</script>

{#if displayTaskEditorDialog}
  <TaskEditor
    task={taskCursor}
    on:close={() => {
      displayTaskEditorDialog = false;
      taskCursor = newBlankTaskObj();
    }}
    on:newTask={(e) => {
      addTaskToLocalDb(e.detail);
      taskCursor = newBlankTaskObj();
      displayTaskEditorDialog = false;
    }}
  />
  <!-- Show task list -->
{:else}
  <div id="main" class:scroll-lock={disabledScroll}>
    <TasksTopBar
      bind:scope
      on:changeScope={async (e) => {
        // BUG: this is not working as expected should be able to use completedDisplay tasks
        switch (e.detail[0]) {
          case "completed":
            // incompleteDisplayedTasks = null;
            // completedDisplayedTasks = [];
            tasks = await getCompletedTasks(e.detail[0]);
            // console.log(completedDisplayedTasks);
            break;
          default:
            // completedDisplayedTasks = null;
            tasks = await getIncompleteTasksTimeline(e.detail[0]);
        }

        // Disable re-ordering if not today or unassigned
        if (e.detail[0] == "today" || e.detail[0] == "unassigned") {
          dragDisabled = false;
        } else {
          dragDisabled = true;
        }
      }}
    />

    <!-- TODO: add overdue tasks in today page (maybe make Today it's own component) -->
    <div id="task-list">
      {#if scope == "today"}
        <TodayView {db} /> <!-- Might need a await here? -->
      {:else}
        <!-- Have the simple list (unassigned, upcoming and completed) - today is the only one with the special set of lists-->
        {#key tasks}
          <TaskList {tasks} />
        {/key}
      {/if}
      <!-- TODO: test this to re-render component based on refresh -->
      <!-- {#if incompleteDisplayedTasks}
        {#key incompleteDisplayedTasks}
        
          <div
            class="tasks"
            use:dndzone={{
              items: incompleteDisplayedTasks,
              flipDurationMs,
              dragDisabled,
            }}
            on:consider={handleDndConsider}
            on:finalize={handleDndFinalize}
          >
            {#each incompleteDisplayedTasks as task (task.id)}
              <div animate:flip={{ duration: flipDurationMs }}>
                <TaskItem
                  {task}
                  on:toggleEdit={(e) => editTask(e.detail)}
                  on:toggleDone={(e) => completeTask(e.detail)}
                />
              </div>
            {/each}
          </div>
        {/key}
      

        {#if completedDisplayedTasks}
          <hr />
          {#each completedDisplayedTasks as task}
            <TaskItem {task} />
          {/each}
        {/if}
      {/if} -->
      <!-- Only enable re-ordering on today and unordered -->
    </div>
    <div id="bottomBar">
      <button
        id="newTaskButton"
        on:click={() => (displayTaskEditorDialog = true)}
      >
        +
      </button>
    </div>
  </div>
{/if}

<style>
  #main {
    height: 100%;
  }

  /* make the task list the height of main minus the  topbar and bottom bar of 50px */
  #task-list {
    height: calc(100% - 100px); /* 100px = 50px topbar + 50px bottombar */
    max-width: 800px;
    margin: 0 auto; /* center the task list */
  }

  #bottomBar {
    height: 50px;
    width: 100%;
  }

  /* large round button center bottom of the screen */
  #newTaskButton {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    font-size: 30px;
    border: none;
    outline: none;
    cursor: pointer;
    position: absolute;
  }
</style>
