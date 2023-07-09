<script lang="ts">
  import type { MenuItem } from "../interfaces/menuItem";
  import { location } from "svelte-spa-router";

  export let menuItems: MenuItem[] = [];

  let displayMenu: boolean = false;

  function getFirstRoute(path: string) {
    return path.split("/")[1];
  }
</script>

<button
  on:click={() => {
    displayMenu = true;
  }}>&#8942;</button
>
{#if displayMenu}
  <div id="menuContent">
    <ul id="menu">
      <!-- for each menu item -->
      {#each menuItems as menuItem}
        {#if getFirstRoute(menuItem.link) == getFirstRoute($location)}
          <!-- grey list item -->
          <li class="menuItem activeMenuItem">
            <a
              class="menuLink"
              href="/#{menuItem.link}"
              on:click={menuItem.onClick}>{menuItem.name}</a
            >
          </li>
        {:else}
          <li class="menuItem">
            <a
              class="menuLink"
              href="/#{menuItem.link}"
              on:click={menuItem.onClick}>{menuItem.name}</a
            >
          </li>
        {/if}
      {/each}
    </ul>
  </div>
  <div
    id="menuBackground"
    on:click={() => {
      displayMenu = false;
    }}
    on:keypress={() => {
      displayMenu = false;
    }}
  />
{/if}

<style>
  #menuContent {
    position: absolute;
    top: 60px;
    right: 0;
    width: 200px;
    background-color: white;
    border: 1px solid black;
    z-index: 100;
  }

  #menu {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .menuItem {
    padding: 10px;
    border-bottom: 1px solid black;
  }

  .menuItem:last-child {
    border-bottom: none;
  }

  .activeMenuItem {
    background-color: #eee;
  }

  .menuItem:hover {
    background-color: #eee;
  }

  .menuLink {
    text-decoration: none;
    color: black;
    display: block;
    width: 100%;
    height: 100%;
  }

  #menuBackground {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
  }
</style>
