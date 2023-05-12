<script lang="ts">
  import { onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  import { authDb, getActiveUserDatabaseName } from "./couch";

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
        replace("/");
      }
    });
  }
</script>

<p>{onlineStatus}</p>
{#if onlineStatus}
  <form on:submit|preventDefault={login}>
    <h1>Login</h1>
    <label for="email">Email</label>
    <input type="email" bind:value={email} />
    <label for="password">Password</label>
    <input type="password" bind:value={password} />
    <button type="submit">Login</button>
    <p>{errorMsg}</p>
  </form>
{:else}
  <p>Please login in when you are next online</p>
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
