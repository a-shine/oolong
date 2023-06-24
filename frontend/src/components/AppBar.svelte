<script lang="ts">
  import { popWrapper as pop } from "../lib/navigatorWrapper";
  import { backButton } from "../lib/navigatorWrapper";
  import AppBarItem from "./AppBarItem.svelte";

  let displayBackButton: boolean = false;

  backButton.subscribe((n) => {
    displayBackButton = n > 0;
  });
</script>

<div id="bar">
  <div id="left">
    {#if displayBackButton}
      <AppBarItem><button on:click={() => pop()}>&larr;</button></AppBarItem>
    {/if}
    <slot name="left" />
  </div>
  <div id="center"><slot name="center" /></div>
  <div id="right"><slot name="right" /></div>
</div>

<style>
  #bar {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
  }

  #left {
    margin-right: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  /* push to the right of the container */
  #right {
    margin-left: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  #center {
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: row;
    align-items: center;

    /* Center from the mid-point of the content */
    left: 50%;
    transform: translateX(-50%);
  }
</style>
