<script lang="ts">
  import { replaceWrapper as replace } from "../lib/navigatorWrapper";
  import {
    authDb,
    checkUserWorkspaceDatabase,
    createWorkspace,
    getActiveUserDatabaseName,
    initUserDb,
    workspaceDb
  } from "../lib/couch";
  import AppBar from "../components/TopBar.svelte";
  import AppBarItem from "../components/BarItem.svelte";
  import Scafold from "../components/Scaffold.svelte";
  import PouchDb from "pouchdb-browser";

  let onlineStatus: boolean = navigator.onLine;

  let email: string;
  let password: string;

  let errorMsg = "";

  // Register event listeners to update onlineStatus when browser goes online
  // or offline
  window.addEventListener("offline", (e) => {
    onlineStatus = false;
  });
  window.addEventListener("online", (e) => {
    onlineStatus = true;
  });

  async function login() {
    authDb.logIn(email, password, async function (err, response) {
      if (err) {
        if (err.name === "unauthorized" || err.name === "forbidden") {
          // name or password incorrect
          errorMsg = "Invalid email or password";
        } else {
          // cosmic rays, a meteor, etc.
        }
      } else {
        const userDbName = await getActiveUserDatabaseName();
        localStorage.setItem("userDbName", userDbName);
        checkUserWorkspaceDatabase();
        initUserDb();
        replace("/");
      }
    });
  }
</script>

<Scafold title="Login">
  {#if onlineStatus}
    <div style="padding: 0.2rem;">
      <form on:submit|preventDefault={login}>
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={email} />
        <label for="password">Password</label>
        <input id="password" type="password" bind:value={password} />
        <button type="submit" class="fl-btn">Login</button>
        <p>{errorMsg}</p>
      </form>
    </div>
  {:else}
    <p>Please login in when you are next online.</p>
  {/if}
</Scafold>

<!--<AppBar>-->
<!--  <div slot="center">-->
<!--    <AppBarItem><b>Login</b></AppBarItem>-->
<!--  </div>-->
<!--</AppBar>-->



<style>
  /* center form horizontally */
  form {
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: 0 auto;
  }
  input {
    margin-bottom: 10px;
  }
  button {
    margin-top: 10px;
  }
</style>
