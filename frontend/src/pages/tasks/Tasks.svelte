<script lang="ts">
    import {pushWrapper, replaceWrapper,} from "../../lib/navigatorWrapper";
    import {overrideItemIdKeyNameBeforeInitialisingDndZones} from "svelte-dnd-action";
    import {logout, taskDb, getWorkspaces} from "../../lib/couch";
    import {getCompletedTasks, getUnassignedTasks, getUpcomingTasks,} from "../../lib/tasks";

    // Types
    import type {Task} from "../../lib/actionListItem";

    // Components
    import TodayView from "./TodayView.svelte";
    import TaskList from "../../components/tasks/TaskList.svelte";
    import UpcomingView from "./UpcomingView.svelte";
    import Dialog from "../../components/Dialog.svelte";
    import {reloadStore, triggerReload} from "../../lib/reloadStore";
    import Scaffold from "../../components/Scaffold.svelte";

    // Required for svelte-dnd-action to work with PouchDB ids
    // https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
    overrideItemIdKeyNameBeforeInitialisingDndZones("_id");

    // TODO: Today task view not working with workspace selector

    // Props
    export let params: { workspace: string, scope: string };

    let confirmLogoutDialog: HTMLDialogElement;

    /**
     * @returns a promise of the tasks list based on the component scope setting
     */
    async function getTasks(scope: string): Promise<Task[]> {
        switch (scope) {
            case "unassigned":
                return (await getUnassignedTasks(params.workspace)).docs;
            case "upcoming":
                return (await getUpcomingTasks(params.workspace)).docs;
            case "completed":
                return (await getCompletedTasks(params.workspace)).docs;
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

<Scaffold
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
                        bind:value={params.workspace}
                        on:change={(e) => {
                            // @ts-ignore
                            replaceWrapper(`/tasks/${e.target.value}/${params.scope}`);
                        }}
                >
                    {#each workspaces as workspace}
                        <option value={workspace._id}>{workspace.name}</option>
                    {/each}
                </select>
            {:catch error}
                <p>{error.message}</p>
            {/await}
            <select
                    id="scopeSelector"
                    bind:value={params.scope}
                    on:change={(e) => {
                        // @ts-ignore
                        replaceWrapper(`/tasks/${params.workspace}/${e.target.value}`);
                    }}
            >
                <option value="unassigned">Unassigned</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
            </select>
            <!-- select workspace from list of workspaces in user workspace pouchdb -->
            {#key $reloadStore}
                {#if params.scope === "today"}
                    {#key params.workspace}
                        <TodayView workspaceId="{params.workspace}"/>
                    {/key}
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
</Scaffold>


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
