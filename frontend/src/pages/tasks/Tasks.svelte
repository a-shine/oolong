<script lang="ts">
    import {pushWrapper, replaceWrapper,} from "../../lib/navigatorWrapper";
    import {overrideItemIdKeyNameBeforeInitialisingDndZones} from "svelte-dnd-action";
    import {taskDb, workspaceDb, logout} from "../../lib/couch";
    import {getCompletedTasks, getUnassignedTasks, getUpcomingTasks,} from "../../lib/tasks";

    // Types
    import type {Task} from "../../lib/actionListItem";

    // Components
    import TodayView from "./TodayView.svelte";
    import TaskList from "../../components/tasks/TaskList.svelte";
    import UpcomingView from "./UpcomingView.svelte";
    import TopBarTasksScopeSelector from "../../components/tasks/TopBarTasksScopeSelector.svelte";
    import Scafold from "../../components/Scaffold.svelte";
    import Dialog from "../../components/Dialog.svelte";
    import {reloadStore, triggerReload} from "../../lib/reloadStore";

    overrideItemIdKeyNameBeforeInitialisingDndZones("_id"); // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name

    // Props
    export let params: { scope: string };

    // Displayed tasks are determined by the scope, on changes to scope, the task
    // list is updated
    // let displayedTasks: Task[];

    let confirmLogoutDialog: HTMLDialogElement;

    /**
     * @returns a promise of the tasks list based on the component scope setting
     */
    async function getTasks(scope: string): Promise<Task[]> {
        switch (scope) {
            case "unassigned":
                return (await getUnassignedTasks()).docs;
            case "upcoming":
                return (await getUpcomingTasks()).docs;
            case "completed":
                return (await getCompletedTasks()).docs;
            default:
                console.log("Incorrect task retrieval scope");
                return [];
        }
    }

    // Toggle between complete and incomplete
    function complete(task: Task) {
        taskDb.put({
            ...task,
        });
        triggerReload();
    }

    function updateOrder(tasks: Task[]) {
        taskDb.bulkDocs(tasks);
    }

    //   menu item object has an action function and a label
    const menuItems = [
        {
            label: "Settings",
            action: () => {
                pushWrapper("/settings");
            },
        },
        {
            label: "Logout",
            action: () => {
                confirmLogoutDialog.showModal();
            },
        }
    ];

    /**
     * @returns a promise of the workspaces list
     */
    async function getWorkspaces(): Promise<string[]> {
        return (await workspaceDb.allDocs()).rows.map((row) => row.id);
    }


</script>

<Dialog
        actions={[
            {
                label: "Cancel",
                handler: () => {
                    confirmLogoutDialog.close();
                },
            },
            {
                label: "Logout",
                handler: () => {
                    logout();
                    replaceWrapper("/welcome");
                },
            },
        ]}
        bind:dialog={confirmLogoutDialog}
        content="Are you sure you want to logout? You will require an internet connection to login again."
        on:close={() => console.log('closed')}
        title="Confirm Logout"
/>

<Scafold
        actionItems="{menuItems}"
        title="Tasks"
>
    <div id="container">
        <div class="center" id="tasks">
            {#await getWorkspaces()}
                <p>Loading...</p>
            {:then workspaces}
                <select
                        id="workspaceSelector"
                        on:change={(e) => {
                            // @ts-ignore
                            replaceWrapper(`/tasks/${params.scope}?workspace=${e.target.value}`);
                        }}
                >
                    {#each workspaces as workspace}
                        <option value={workspace}>{workspace}</option>
                    {/each}
                </select>
            {:catch error}
                <p>{error.message}</p>
            {/await}
            <TopBarTasksScopeSelector/>
            <!-- select workspace from list of workspaces in user workspace pouchdb -->
            {#key $reloadStore}
                {#if params.scope === "today"}
                    <TodayView/>
                {:else if params.scope === "upcoming"}
                    {#await getTasks(params.scope)}
                        <p>Loading...</p>
                    {:then tasks}
                        <UpcomingView tasks={tasks} on:toggleComplete={(e) => complete(e.detail)}/>
                    {:catch error}
                        <p>{error.message}</p>
                    {/await}
                {:else if params.scope === "unassigned"}
                    {#await getTasks(params.scope)}
                        <p>Loading...</p>
                    {:then tasks}
                        <TaskList
                                enableOrdering={true}
                                {tasks}
                                on:toggleComplete={(e) => complete(e.detail)}
                                on:updateOrder={(e) => updateOrder(e.detail)}
                        />
                    {:catch error}
                        <p>{error.message}</p>
                    {/await}
                {:else if params.scope === "completed"}
                    {#await getTasks(params.scope)}
                        <p>Loading...</p>
                    {:then tasks}
                        <TaskList
                                {tasks}
                                on:toggleComplete={(e) => complete(e.detail)}
                        />
                    {:catch error}
                        <p>{error.message}</p>
                    {/await}
                {:else}
                    <p>Invalid scope</p>
                {/if}
            {/key}
        </div>
    </div>


    <button
            id="newTaskButton"
            on:click={() => {
                    pushWrapper("/tasks/editor/-1");
                }
            }>
        +
    </button>
</Scafold>


<style>
    #container {
        position: fixed;
        left: 0;
        right: 0;
        overflow-y: auto;
        height: 100%;
        max-width: 800px;
        margin: auto;
        padding: 0 0.5rem;
    }

    /* New task btn fixed horizontally centred at the bottom of the page */
    #newTaskButton {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 65px;
        height: 65px;
        border-radius: 50%;
        border: none;
        font-size: 2rem;
        font-weight: bold;
        z-index: 100;
    }
</style>
