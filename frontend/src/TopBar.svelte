<script lang="ts">
  import { location } from "svelte-spa-router";
  import TopBarTasksScopeSelector from "./lib/TopBarTasksScopeSelector.svelte";
  import Logout from "./lib/Logout.svelte";

  // extract the first part of the path, e.g. /tasks/today -> /tasks
  function extractPath(path: string): string[] {
    return path.split("/");
  }
</script>

<div id="container" class="bg-primary">
  {#if extractPath($location)[1] === "tasks" && extractPath($location)[2] !== "editor"}
    <div class="bar-item">
      <TopBarTasksScopeSelector />
    </div>
  {/if}
  <div id="right-side">
    <!-- If not on /login page -->
    {#if $location !== "/login"}
      <div class="bar-item">
        <Logout />
      </div>
    {/if}
  </div>
</div>

<style>
  #container {
    position: fixed;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
  }

  /* push to the right of the container */
  #right-side {
    margin-left: auto;
  }

  .bar-item {
    margin: 0 10px;
  }
</style>
