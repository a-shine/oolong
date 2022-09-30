<script lang="ts">
  import { onMount } from "svelte";

  let onlineFlag: boolean;
  window.addEventListener("offline", (e) => {
    console.log("offline");
    onlineFlag = false;
  });
  window.addEventListener("online", (e) => {
    console.log("online");
    onlineFlag = true;
  });

  const dbrequest = window.indexedDB.open("todos");
  dbrequest.onerror = (e) => {
    console.log("Unable to open a connetion to the local db");
  };
  dbrequest.onsuccess = (e) => {
    console.log("Yay connected");
    const db = e.target.result;
    // console.log(db);
    const taskStore = db.createObjectStore("tasks", { keyPath: "ssn" });
  };

  onMount(() => {
    if (navigator.onLine) {
      onlineFlag = true;
    } else {
      onlineFlag = false;
    }
  });
</script>

<main>
  {#if onlineFlag}
    <span>online</span>
  {:else}
    <span>offline</span>
  {/if}
  <h1>Hello world!</h1>
</main>

<style>
</style>
