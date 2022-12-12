<script lang="ts">
    import TaskItem from "./TaskItem.svelte";

    import type { Task } from "./types/task.type";

    import NewTask from "./NewTask.svelte";
    import Filter from "./Filter.svelte";

    let display = "today";
    let completed = false;

    let displayTasks: Task[] = [];

    // let db;

    let displayTaskEditorModal: boolean = false;

    // TODO: Implement ordering logic for the Today and Upcoming todos

    // tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
    // or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be evergrowing but may be the easiet solution)

    const dbrequest = window.indexedDB.open("tasks");

    let db: IDBDatabase | null = null;

    dbrequest.onsuccess = (e) => {
        db = (e.target as IDBOpenDBRequest).result;
        syncWithRemote();
        getTasksToDisplay();
    };
    dbrequest.onupgradeneeded = (e) => {
        console.log("upgrading db");
        db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("tasks")) {
            const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
            taskStore.createIndex("due", "due", { unique: false });
            taskStore.createIndex("due, complete", ["due", "complete"]);
            taskStore.createIndex("due, complete, index", [
                "due",
                "complete",
                "index",
            ]);
        }
    };
    dbrequest.onerror = (e) => {
        console.log((e.target as IDBOpenDBRequest).error);
    };

    function addTaskLocal(task: Task) {
        const req = db
            .transaction("tasks", "readwrite")
            .objectStore("tasks")
            .add(task);

        req.onerror = (e) => {
            // console.log(e.target.errorCode);
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

    // function sort(tasks: Task[]) {
    //     return tasks.sort((a, b) => {
    //         if (a.prioritise && !b.prioritise) {
    //             return -1;
    //         } else if (!a.prioritise && b.prioritise) {
    //             return 1;
    //         } else {
    //             return 0;
    //         }
    //     });
    // }

    function sortCompleted() {
        displayTasks = displayTasks.filter((task) => {
            return task.complete === completed;
        });
    }

    function sortByIndex(tasks: Task[]) {
        return tasks.sort((a, b) => {
            if (a.index < b.index) {
                return -1;
            } else if (a.index > b.index) {
                return 1;
            } else {
                return 0;
            }
        });
    }

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
                        displayTasks = sortByIndex(displayTasks);
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
                // displayTasks = sortByPrioritise(displayTasks);
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

    function createTaskAndUpdateDisplay(task: Task) {
        saveTask(task);
        updateDisplayedTasks(task);
    }

    function updateTaskAndUpdateDisplay(task: Task) {
        saveTask(task);
        // if task passes filter add to display tasks else don't do anything
        if (display == "all") {
            displayTasks = [...displayTasks];
        } else if (display == "today") {
            let today = new Date().setHours(0, 0, 0, 0);
            let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
            if (task.due >= today && task.due < tomorrow) {
                // displayTasks.push(task);
                displayTasks = [...displayTasks];
                // displayTasks = sortByPrioritise(displayTasks);
            } else {
                displayTasks = displayTasks.filter((t) => t.id != task.id);
            }
        } else if (display == "upcoming") {
            let tomorrow = new Date().setHours(0, 0, 0, 0) + 86400000;
            if (task.due >= tomorrow) {
                displayTasks = [...displayTasks];
            } else {
                displayTasks = displayTasks.filter((t) => t.id != task.id);
            }
        } else if (display == "unassigned") {
            if (task.due == -1) {
                displayTasks = [...displayTasks];
            } else {
                displayTasks = displayTasks.filter((t) => t.id != task.id);
            }
        }
    }

    function deleteTaskAndUpdateDisplay(task: Task) {
        deleteTask(task);
        displayTasks = displayTasks.filter((t) => t.id != task.id);
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
                // createNotification(task);
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
        taskStore.put(task);
        // TODO: Do remote as well
    }

    function deleteTask(task: Task): void {
        const tx = db.transaction("tasks", "readwrite");
        const taskStore = tx.objectStore("tasks");
        taskStore.delete(task.id);
    }

    function showNotification() {
        // https://chromestatus.com/feature/5133150283890688
        if ("showTrigger" in Notification.prototype) {
            /* Notification Triggers supported */
            console.log("Notification Triggers supported");
        }
        Notification.requestPermission((result) => {
            if (result === "granted") {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification("Vibration Sample", {
                        body: "Buzz! Buzz!",
                        icon: "../images/touch/chrome-touch-icon-192x192.png",
                        vibrate: [200, 100, 200, 100, 200, 100, 200],
                        tag: "vibration-sample",
                        showTrigger: new TimestampTrigger(10),
                    });
                });
            }
        });
    }

    function updateDisplayedTask() {
        displayTasks = [...displayTasks];
    }
</script>

<div id="main">
    <Filter bind:display bind:completed {getTasksToDisplay} {sortCompleted} />

    <!-- TODO: Have the ability to define a custom order in unasigned and today i.e. by default add newer requests at the end but have the ability to move round to re-prioritise -->
    <!-- if no tasks to display -->
    {#if displayTasks.length == 0 && display == "today"}
        <div class="no-tasks">
            <!-- <h1>No tasks to display</h1> -->
            <!-- <p>
                You can add tasks by clicking the <span class="add-task">+</span
                > button in the bottom right corner.
            </p> -->

            <img src="Oolongv1.png" alt="" width="300px" />
            <p>Yay! You're done for the day - enjoy :)</p>
        </div>
    {:else}
        <div class="tasks">
            {#each displayTasks as task}
                <TaskItem
                    bind:task
                    {updateTaskAndUpdateDisplay}
                    {deleteTaskAndUpdateDisplay}
                />
            {/each}
        </div>
    {/if}

    <button on:click={() => (displayTaskEditorModal = true)}> + </button>
    {#if displayTaskEditorModal}
        <NewTask
            displayTasksLenghth={displayTasks.length}
            bind:displayTaskEditorModal
            {createTaskAndUpdateDisplay}
        />
    {/if}
</div>

<style>
    /* center horizontally and vertically */
    .no-tasks {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    /* center content with max width */
    #main {
        max-width: 800px;
        margin: 0 auto;
    }

    /* center button at bottom of screen */
    button {
        position: absolute;
        bottom: 2%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    /* large round button */
    button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: black;
        color: white;
        font-size: 30px;
        border: none;
        outline: none;
        cursor: pointer;
    }
</style>
