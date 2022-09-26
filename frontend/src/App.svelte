<script lang="ts">
  import { ConnectionStatus } from "svelte-connection-status";

  function handleChange({ detail }) {
    if (detail.isOffline) {
      console.log(">>> you are offline");
    }

    if (detail.isOnline) {
      console.log(">>> you are online");
    }
  }
</script>

<main>
  <h1>Hello world!</h1>
  <p>
    you are
    <ConnectionStatus on:change={handleChange}>
      <span slot="offline">offline :(</span>
      <span slot="online">online :)</span>
    </ConnectionStatus>
  </p>
</main>

<style>
</style>
