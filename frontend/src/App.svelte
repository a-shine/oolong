<script lang="ts">
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";

  import { routes } from "./routes";

  let onlineStatus: boolean;

  /**
   * Check if browser supports notifications and request permission to send
   * notifications
   */
  function checkOrEnableNotifications() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    // Request permission to send notifications
    Notification.requestPermission();
  }

  /**
   * Check if browser has internet access or not
   */
  function initOnlineStatus() {
    if (navigator.onLine) {
      onlineStatus = true;
    } else {
      onlineStatus = false;
    }

    // Register event listeners to update onlineStatus when browser goes online
    // or offline
    window.addEventListener("offline", (e) => {
      onlineStatus = false;
    });
    window.addEventListener("online", (e) => {
      onlineStatus = true;
    });
  }

  onMount(() => {
    initOnlineStatus();
    checkOrEnableNotifications();
  });
</script>

<main>
  <Router {routes} />
</main>
