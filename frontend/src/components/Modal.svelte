<script>
  import { fade, fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  let dispatch = createEventDispatcher();

  // On escape key press, close the modal
  // On background click, close the modal
  // On close button click, close the modal

  // Listen for escape key press
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dispatch("close");
    }
  });
</script>

<div
  class="modal-background"
  transition:fade={{ duration: 200 }}
  on:click={() => {
    dispatch("close");
  }}
/>

<div
  class="modal"
  transition:fly={{ y: 200, duration: 200 }}
  role="dialog"
  aria-modal="true"
>
  <div id="topBar">
    <button
      id="closeBtn"
      on:click={() => dispatch("close")}
      aria-label="Close modal">&#x2715</button
    >
  </div>

  <slot />
</div>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: hsla(0, 0%, 0%, 0.5);
    z-index: 100;
  }

  .modal {
    position: absolute;
    left: 50%;
    top: 35%;
    width: calc(100vw - 3em);
    max-width: 32em;
    max-height: calc(100vh - 4em);
    transform: translate(-50%, -50%);
    background: white;
    z-index: 101;
  }

  #topBar {
    width: 100%;
    border: 1px solid #ccc;
    margin-bottom: 10px;
  }
  #closeBtn {
    float: right;
  }
</style>
