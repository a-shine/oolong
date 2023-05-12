<script lang="ts">
  import { replace } from "svelte-spa-router";
  import { authDb, userDb } from "./couch";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  async function logout() {
    await authDb.logOut(); // TODO: may need to do this in web worker
    localStorage.removeItem("userDbName");
    // Delete the pouchdb database
    userDb.destroy();
    dispatch("logout");
    replace("/login");
  }
</script>

<button on:click={logout}>Logout</button>
