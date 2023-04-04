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

  // Register event listeners to update onlineStatus when browser goes online
  // or offline
  window.addEventListener("offline", (e) => {
    onlineStatus = false;
  });
  window.addEventListener("online", (e) => {
    onlineStatus = true;
  });

  onMount(() => {
    // Initialize onlineStatus
    if (navigator.onLine) {
      onlineStatus = true;
    } else {
      onlineStatus = false;
    }

    checkOrEnableNotifications();
  });
</script>

<Router {routes} />
