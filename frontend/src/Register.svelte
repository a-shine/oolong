<script lang="ts">
  import { onMount } from "svelte";
  import { replace } from "svelte-spa-router";

  let email: string;
  let password: string;
  let firstName: string;
  let lastName: string;

  function register() {}
</script>

<!-- basic register form -->
<h1>Register</h1>
<form on:submit|preventDefault={register}>
  <label for="">First name</label>
  <input type="text" bind:value={firstName} />
  <label for="">Last name</label>
  <input type="text" bind:value={lastName} />
  <label for="email">Email</label>
  <input type="email" bind:value={email} />
  <label for="password">Password</label>
  <input type="password" bind:value={password} />
  <button type="submit">Register</button>
</form>

<style>
  /* center form in page vertically and horizontally using flex */
</style>
