<script lang="ts">

import TopBar from "./TopBar.svelte";
import {fade} from "svelte/transition";

export let title: string;
export let actionItems: any[] = [];
</script>

<div in:fade={{duration: 200}}>
    <TopBar title={title}>
        {#each actionItems as item}
            <button on:click={item.action}>{item.label}</button>
        {/each}
    </TopBar>
    <main>
        <slot />
    </main>
</div>


<style>
    main {
        padding: 0 16px;
        position: absolute;
        top: 58px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
    }

    button {
        background: none;
        border: none;
        color: var(--text-colour);
        font-size: 1rem;
        padding: 0 16px;
        height: 100%;
    }
</style>