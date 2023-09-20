<script lang="ts">
    import { fade } from "svelte/transition";

    export let dialog: HTMLDialogElement;

    export let title = "";
    export let content = "";
    export let actions = [];
</script>

<dialog bind:this={dialog} on:close>
    <h3>{title}</h3>
    <p>{content}</p>
    <div id="actions">
        {#each actions as action}
            <button on:click={action.handler} class="dialogActionBtn">{action.label}</button>
        {/each}
    </div>
</dialog>

<style>
    #actions {
        display: flex;
        justify-content: flex-end;
    }

    .dialogActionBtn {
        margin-left: 10px;
    }
</style>