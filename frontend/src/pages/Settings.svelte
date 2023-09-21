<script lang="ts">
    import Scaffold from "../components/Scaffold.svelte";
    import {getWorkspaces} from "../lib/couch";
    import {pushWrapper} from "../lib/navigatorWrapper";


</script>

<Scaffold
        title="Settings"
>
    <div class="card">
        <h3>Workspaces</h3>
        <p>Workspaces are used to group tasks together. You can create as many workspaces as you want. By default there
            is a Personal and Work workspace.</p>

        <!-- List of workspaces -->
        {#await getWorkspaces()}
            <p>Loading...</p>
        {:then workspaces}
            <ul>
                {#each workspaces as workspace}
                    <li><button class="link-button" on:click={() => pushWrapper(`/settings/workspace-configuration/${workspace._id}`)}>{workspace.name}</button></li>
                {/each}
            </ul>
        {:catch error}
            <p>{error.message}</p>
        {/await}

        <!-- Add workspace -->
        <button on:click={() => pushWrapper("/settings/workspace-configuration")}>Add workspace</button>



    </div>
    <div class="card">
        <h3>List behaviour</h3>
        Delete tasks that have been completed for more than 7 days <input disabled type="checkbox">
    </div>
</Scaffold>