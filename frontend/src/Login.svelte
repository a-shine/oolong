<script lang="ts">
  import { replace } from "svelte-spa-router";

  export let remoteCouch: PouchDB.Database<{}>;

  let email: string;
  let password: string;

  let errorMsg = "";

  async function login() {
    remoteCouch.login(email, password, function (err, response) {
      if (err) {
        if (err.name === "unauthorized" || err.name === "forbidden") {
          // name or password incorrect
          errorMsg = "Invalid email or password";
        } else {
          // cosmic rays, a meteor, etc.
        }
      } else {
        replace("/");
      }
    });
  }
</script>

<form on:submit|preventDefault={login}>
  <h1>Login</h1>
  <label for="email">Email</label>
  <input type="email" bind:value={email} />
  <label for="password">Password</label>
  <input type="password" bind:value={password} />
  <button type="submit">Login</button>
  <p>{errorMsg}</p>
</form>

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
