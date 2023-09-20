<script lang="ts">
  import { popWrapper as pop } from "../lib/navigatorWrapper";
  import { backButton } from "../lib/navigatorWrapper";
  import AppBarItem from "./BarItem.svelte";

  let displayBackButton: boolean = false;
  export let title: string;
  // export let actions;

  backButton.subscribe((n) => {
    displayBackButton = n > 0;
  });
</script>

<div id="bar">
  <div id="left">
    {#if displayBackButton}
        <button
          on:click={() => pop()}
          class="app-bar-item"
        >&larr;</button>
    {/if}
    <span style="font-weight: bold; font-size: 1.5rem;">{title}</span>
  </div>
  <div id="right"><slot/></div>
</div>

<style>
  #bar {
    width: 100%;
    height: 58px;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: var(--primary-colour-focus);
  }

  #left {
    margin-right: auto;
      padding-left: 0.5rem;
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

  .app-bar-item {
    /*remove default styling*/
    background: none;
    border: none;
    color: var(--text-colour);
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
  }
</style>
