<script lang="ts">
  import { replace } from "svelte-spa-router";

  export let remoteCouch: PouchDB.Database<{}>;

  async function logout() {
    await remoteCouch.logOut();
    replace("/login");
  }
</script>

<button on:click={logout}>Logout</button>
