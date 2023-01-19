<script>
    import { fade, fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    const close = () => dispatch("close");

    let modal;
</script>

<div
    class="modal-background"
    transition:fade={{ duration: 200 }}
    on:click={close}
/>

<div
    class="modal"
    transition:fly={{ y: 200, duration: 200 }}
    role="dialog"
    aria-modal="true"
    bind:this={modal}
>
    <slot />
</div>

<style>
    .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--base-100-color);
    }

    .modal {
        position: absolute;
        left: 50%;
        top: 50%;
        width: calc(100vw - 4em);
        max-width: 32em;
        max-height: calc(100vh - 4em);
        overflow: auto;
        transform: translate(-50%, -50%);
        padding: 1em;
        border-radius: 0.2em;
    }
</style>
