<script lang="ts">
  import { replace } from "svelte-spa-router";

  export let pdbRemote;

  let email: string;
  let password: string;

  let errorMsg = "";

  // TODO: Move the db and hence auth system to app level
  // pdbRemote.logIn("admin", "admin", function (err, response) {
  //   if (err) {
  //     if (err.name === "unauthorized" || err.name === "forbidden") {
  //       // name or password incorrect
  //     } else {
  //       // cosmic rays, a meteor, etc.
  //     }
  //   }
  // });

  async function login() {
    pdbRemote.login(email, password, function (err, response) {
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

<h1>Login</h1>
<form on:submit|preventDefault={login}>
  <label for="email">Email</label>
  <input type="email" bind:value={email} />
  <label for="password">Password</label>
  <input type="password" bind:value={password} />
  <button type="submit">Login</button>
</form>
<p>{errorMsg}</p>
