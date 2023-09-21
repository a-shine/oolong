<script lang="ts">
    import Scaffold from "../components/Scaffold.svelte";
    import {deleteWorkspace, getWorkspace, updateWorkspaceName, createWorkspace} from "../lib/couch";
    import Dialog from "../components/Dialog.svelte";
    import {popWrapper} from "../lib/navigatorWrapper";

    export let params: { workspaceId: string };

    let confirmDeleteWorkspace: HTMLDialogElement;
</script>

<Dialog
        actions={[
        {
            label: "Cancel",
            handler: () => confirmDeleteWorkspace.close()
        },
        {
            label: "Delete",
            handler: () => {
                confirmDeleteWorkspace.close();
                deleteWorkspace(params.workspaceId);
                // FIXME: going back to the workspace list but the list is not updated
                popWrapper();
                }
        }
    ]}
        bind:dialog={confirmDeleteWorkspace}
        content="Are you sure you want to delete this workspace? You will lose all the tasks in that workspace."
        title="Delete workspace"
>
</Dialog>

{#if params.workspaceId === null}
    <!--    create a new workspace -->
    <Scaffold
            title="New workspace"
    >
        <!-- Update name form -->
        <form on:submit|preventDefault="{() => {
        createWorkspace(document.getElementById('name').value);
        // FIXME: This is a hack to force a reload of the page in order to update the name in the title
        popWrapper();
    }}">
            <label for="name">Name</label>
            <input type="text" id="name" name="name"/>
            <button>Submit name</button>
        </form>
    </Scaffold>

{:else}
    {#await getWorkspace(params.workspaceId)}
        <p>Loading...</p>
    {:then workspace}
        <Scaffold
                title="{workspace.name} workspace"
        >
            <!-- Update name form -->
            <form on:submit|preventDefault="{() => {
        updateWorkspaceName(params.workspaceId, document.getElementById('name').value);
        // FIXME: This is a hack to force a reload of the page in order to update the name in the title
        window.location.reload();
    }}">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" value="{workspace.name}"/>
                <button>Update name</button>
            </form>
            <button on:click={()=> confirmDeleteWorkspace.showModal()}>Delete workspace</button>
        </Scaffold>
    {:catch error}
        <p>{error.message}</p>
    {/await}
{/if}

