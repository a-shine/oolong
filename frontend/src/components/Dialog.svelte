<script lang="ts">
  import { onMount } from "svelte";

  let dialog;

  onMount(() => {
    dialog = document.getElementById("dialog");
    dialog.showModal();
  });
</script>

<dialog id="dialog">
  <slot />
</dialog>
