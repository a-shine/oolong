<script lang="ts">
    import TaskItem from "./TaskItem.svelte";

    import type { Task } from "./types/task.type";

    import NewTask from "./NewTask.svelte";
    import Filter from "./Filter.svelte";

    let display = "today";
    let completed = false;

    let displayTasks: Task[] = [];

    let db;

    // let displayNewTaskModal: boolean = false;
    let displayTaskEditorModal: boolean = false;

    // tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
    // or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be evergrowing but may be the easiet solution)

    const dbrequest = window.indexedDB.open("tasks");

    dbrequest.onsuccess = (e) => {
        db = e.target.result;
        syncWithRemote();
        getTasksToDisplay();
    };
    dbrequest.onupgradeneeded = (e) => {
        console.log("upgrading db");
        db = e.target.result;
        if (!db.objectStoreNames.contains("tasks")) {
            const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
            taskStore.createIndex("due", "due", { unique: false });
        }
    };
    dbrequest.onerror = (e) => {
        console.log(e.target.error);
    };

    function addTaskLocal(task: Task) {
        const req = db
            .transaction("tasks", "readwrite")
            .objectStore("tasks")
            .add(task);

        req.onerror = (e) => {
            console.log(e.target.errorCode);
        };
    }

    function addTaskRemote(task: Task) {
        var response = fetch("http://localhost:8000/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
        console.log(response);
    }

    function addTask(task: Task) {
        // displayTasks.push(task);
        addTaskRemote(task);
        addTaskLocal(task);
    }

    function createNotification(task: Task) {
        const option = {
            body: task.content,
            icon: "https://svelte.dev/favicon.png",
            timestamp: task.due,
        };
        const notification = new Notification("Task Due", option);
        // sw.showNotification(notification);
    }

    // BUG: There seems to be a problem submitting a task on mobile devices when associated with a time
    // function saveTask(task: Task) {
    //     addTask(task);
    //     if (task.withTime) {
    //         // createNotification(task);
    //     }
    //     // createNotification(task); // BUG: add this to the add task function so that synced tasks can be notified too
    //     updateDisplay(); // better way would be to add the task to the display tasks array if it matches the filter else do nothing and rely on fetching filtered tasks when complete
    // }

    function getTasksToDisplay() {
        displayTasks = [];
        const tx = db.transaction("tasks", "readonly");
        const taskStore = tx.objectStore("tasks");

        switch (display) {
            case "all":
                const allReq = taskStore.getAll();
                allReq.onsuccess = (e) => {
                    displayTasks = allReq.result;
                };
                break;
            case "today":
                {
                    let today = new Date().setHours(0, 0, 0, 0);
                    let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
                    let range = IDBKeyRange.bound(today, tomorrow, false, true);
                    const todayReq = taskStore.index("due").getAll(range);
                    todayReq.onsuccess = (e) => {
                        let request = e.target;
                        displayTasks = request.result;
                    };
                }
                break;
            case "upcoming":
                {
                    let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
                    let range = IDBKeyRange.lowerBound(tomorrow, false);
                    const upcomingReq = taskStore.index("due").getAll(range);
                    upcomingReq.onsuccess = (e) => {
                        let request = e.target;
                        displayTasks = request.result;
                    };
                }
                break;
            case "unassigned":
                {
                    let range = IDBKeyRange.only(-1);
                    const unassignedReq = taskStore.index("due").getAll(range);
                    unassignedReq.onsuccess = (e) => {
                        let request = e.target;
                        displayTasks = request.result;
                    };
                }
                break;
        }
    }

    function updateDisplayedTasks(task: Task) {
        // if task passes filter add to display tasks else don't do anything
        if (display == "all") {
            displayTasks = [...displayTasks, task];
        } else if (display == "today") {
            let today = new Date().setHours(0, 0, 0, 0);
            let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
            if (task.due >= today && task.due < tomorrow) {
                // displayTasks.push(task);
                displayTasks = [...displayTasks, task];
            }
        } else if (display == "upcoming") {
            let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
            if (task.due >= tomorrow) {
                displayTasks = [...displayTasks, task];
            }
        } else if (display == "unassigned") {
            if (task.due == -1) {
                displayTasks = [...displayTasks, task];
            }
        }
    }

    function getPersistentLastSynced() {
        return localStorage.getItem("lastSynced");
    }

    function setPersistentLastSynced() {
        localStorage.setItem("lastSynced", new Date().toISOString());
    }

    function getRemoteTasks(): Promise<Task[]> {
        return fetch("http://localhost:8000/tasks")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                return data;
            });
    }

    function getRemoteLastUpdated(lastSynced): Promise<Task[]> {
        return fetch("http://localhost:8000/tasks/updatedSince", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ lastSynced: lastSynced }),
        })
            .then((response) => response.json())
            .then((data) => {
                return data;
            });
    }

    function createOrUppdateTasks(tasks: Task[]) {
        const tx = db.transaction("tasks", "readwrite");
        const taskStore = tx.objectStore("tasks");
        tasks.forEach((task) => {
            taskStore.put(task);
            if (task.withTime) {
                createNotification(task);
            }
        });
    }

    function deleteTasks(tasks: Task[]) {
        const tx = db.transaction("tasks", "readwrite");
        const taskStore = tx.objectStore("tasks");
        tasks.forEach((task) => {
            taskStore.delete(task.id);
        });
    }

    function getRemoteDeletedSince(lastSynced): Promise<Task[]> {
        return fetch("http://localhost:8000/tasks/deletedSince", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ lastSynced: lastSynced }),
        })
            .then((response) => response.json())
            .then((data) => {
                return data;
            });
    }

    function syncWithRemote() {
        // let remoteTasks: Task[] = [];
        let lastSynced = getPersistentLastSynced();
        if (lastSynced) {
            Promise.all([
                getRemoteLastUpdated(lastSynced),
                getRemoteDeletedSince(lastSynced),
            ]).then((tasks) => {
                createOrUppdateTasks(tasks[0]);
                deleteTasks(tasks[1]);
                setPersistentLastSynced();
                getTasksToDisplay();
            });
        } else {
            getRemoteTasks().then((tasks) => {
                createOrUppdateTasks(tasks);
                setPersistentLastSynced();
                getTasksToDisplay();
            });
        }
    }

    function saveTask(task: Task): void {
        const tx = db.transaction("tasks", "readwrite");
        const taskStore = tx.objectStore("tasks");
        task.complete = !task.complete;
        taskStore.put(task);
        // TODO: Do remote as well
    }

    function editTask(task: Task) {
        // const tx = db.transaction("tasks", "readwrite");
        // const taskStore = tx.objectStore("tasks");
        // taskStore.put(task);
        console.log("edit task");
    }
</script>

<Filter bind:display bind:completed updateDisplay={getTasksToDisplay} />

<ul>
    {#each displayTasks as task}
        <li>
            <TaskItem {task} {saveTask} />
        </li>
    {/each}
</ul>

<button on:click={() => (displayTaskEditorModal = true)}> New task </button>
{#if displayTaskEditorModal}
    <NewTask bind:displayTaskEditorModal {saveTask} {updateDisplayedTasks} />
{/if}
