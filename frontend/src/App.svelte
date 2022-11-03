<script lang="ts">
  import { onMount } from "svelte";
  import Tasks from "./Tasks.svelte";

  let onlineFlag: boolean;

  window.addEventListener("offline", (e) => {
    onlineFlag = false;
  });
  window.addEventListener("online", (e) => {
    onlineFlag = true;
  });

  function checkOrEnableNotifications() {
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification("Hi there!");
        }
      });
    }
  }

  onMount(() => {
    if (navigator.onLine) {
      onlineFlag = true;
    } else {
      onlineFlag = false;
    }

    checkOrEnableNotifications();
  });
</script>

<main>
  <!-- {#if onlineFlag}
    <span>online</span>
  {:else}
    <span>offline</span>
  {/if} -->
  <Tasks />
</main>
