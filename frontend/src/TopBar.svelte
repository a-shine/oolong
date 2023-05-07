<script lang="ts">
  import { location, querystring } from "svelte-spa-router";
  import TopBarTasksScopeSelector from "./TopBarTasksScopeSelector.svelte";

  // extract the first part of the path, e.g. /tasks/today -> /tasks
  function extractPath(path: string): string {
    return path.split("/")[1];
  }
</script>

<div id="container" class="bg-primary">
  {#if extractPath($location) === "tasks"}
    <div class="bar-item">
      <TopBarTasksScopeSelector />
    </div>
  {/if}
  <div id="right-side" />
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
