<script lang="ts">
  import { popWrapper as pop } from "../lib/navigatorWrapper";
  import { backButton } from "../lib/navigatorWrapper";
  import AppBarItem from "./BarItem.svelte";
  import DropdownMenu from "./DropdownMenu.svelte";

  let displayBackButton: boolean = false;

  backButton.subscribe((n) => {
    displayBackButton = n > 0;
  });
</script>

<div id="bar">
  <div id="left">
    {#if displayBackButton}
      <AppBarItem
        ><button
          on:click={() => pop()}
          style="font-size : 20px; font-weight: 999;">&larr;</button
        ></AppBarItem
      >
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
    align-items: center;

    /* bottom thin black border */
    border-bottom: 1px solid black;
  }

  #left {
    margin-right: auto;
  }

  /* push to the right of the container */
  #right {
    margin-left: auto;
  }

  #center {
    /* force center of screen absolute */
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
