<script>
  import { fade, fly } from "svelte/transition";
</script>

<div class="modal-background" transition:fade={{ duration: 200 }} />

<div
  class="modal"
  transition:fly={{ y: 200, duration: 200 }}
  role="dialog"
  aria-modal="true"
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
    top: 35%;
    width: calc(100vw - 3em);
    max-width: 32em;
    max-height: calc(100vh - 4em);
    transform: translate(-50%, -50%);
    border: solid 1px black;
  }
</style>
