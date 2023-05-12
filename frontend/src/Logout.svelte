<script lang="ts">
  import { replace } from "svelte-spa-router";
  import { authDb, userDb } from "./couch";

  async function logout() {
    await authDb.logOut(); // TODO: may need to do this in web worker
    localStorage.removeItem("userDbName");
    // delete the pouchdb database
    userDb.destroy();
    replace("/login");
  }
</script>

<button on:click={logout}>Logout</button>
