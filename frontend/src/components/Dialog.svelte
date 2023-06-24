<script lang="ts">
  export let dialog;
</script>

<dialog bind:this={dialog} on:close>
  <slot />
</dialog>

<!-- <button on:click={() => dialog.showModal()}>OPen</button>
<button on:click={() => console.log("test")}>test</button>
<Dialog bind:dialog>This is some content</Dialog> -->
