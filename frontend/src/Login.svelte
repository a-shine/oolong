<script lang="ts">
    let email: string;
    let password: string;

    function login() {
        return;
    }
</script>

<h1>Login</h1>
<form on:submit|preventDefault={login}>
    <label for="email">Email</label>
    <input type="email" bind:value={email} />
    <label for="password">Password</label>
    <input type="password" bind:value={password} />
    <button type="submit">Register</button>
</form>
