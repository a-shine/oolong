<script lang="ts">
  import { replace } from "svelte-spa-router";

  // BUG: Not finding type definition for PouchDB
  import type { PouchDB } from "pouchdb-browser";

  export let remoteCouch: PouchDB.Database<{}>;

  async function logout() {
    await remoteCouch.logOut();
    replace("/login");
  }
</script>

<button on:click={logout}>Logout</button>
