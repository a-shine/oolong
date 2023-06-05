<script lang="ts">
  import { replaceWrapper as replace } from "../navigatorWrapper";
  import { authDb, getActiveUserDatabaseName, initUserDb } from "../couch";
  import AppBar from "../lib/AppBar.svelte";
  import AppBarItem from "../lib/AppBarItem.svelte";

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
        initUserDb();
        replace("/");
      }
    });
  }
</script>

<AppBar>
  <div slot="center">
    <AppBarItem><b>Login</b></AppBarItem>
  </div>
</AppBar>

{#if onlineStatus}
  <div style="padding: 0.2rem;">
    <form on:submit|preventDefault={login}>
      <label for="email">Email</label>
      <input type="email" bind:value={email} />
      <label for="password">Password</label>
      <input type="password" bind:value={password} />
      <button type="submit" class="fl-btn">Login</button>
      <p>{errorMsg}</p>
    </form>
  </div>
{:else}
  <p>Please login in when you are next online.</p>
{/if}

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
