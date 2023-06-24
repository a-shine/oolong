<script lang="ts">
  import { onMount } from "svelte";

  import Router, { replace, location } from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";

  // TODO: Big code refactor, clean and debug

  // This was tricky to get working!
  // - https://stackoverflow.com/questions/75808603/vitesveltepouchdb-uncaught-typeerror-class-extends-value-object-object-is
  // - https://github.com/pouchdb/pouchdb/issues/8516
  import PouchDb from "pouchdb-browser";
  import PouchDBFind from "pouchdb-find";
  import PouchDbAuth from "pouchdb-authentication";
  PouchDb.plugin(PouchDBFind);
  PouchDb.plugin(PouchDbAuth);

  // Components
  import Login from "./pages/Login.svelte";
  import Tasks from "./pages/tasks/Tasks.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import TaskEditor from "./pages/tasks/TaskEditor.svelte";

  import { setup, notSetup, initUserDb } from "./lib/couch";
  import Welcome from "./pages/Welcome.svelte";

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
    console.log("here");
    onlineStatus = false;
  });
  window.addEventListener("online", (e) => {
    onlineStatus = true;
  });

  // We can put all sorts of things in the user db (not only tasks)

  // Need to get name of active user in order to get the correct database

  // Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its
  // pre-condition failed. If the pre-condition failed on a route other than the "/login" route then it must mean that
  // the user is not authenticated and hence we redirect to "/login". If the pre-condition failed on the "/login" route,
  // it means the user must be authenticated and hence the user is redirected to the "/" route.
  function conditionsFailed(event) {
    switch (event.detail.route) {
      case "/":
        replace("/tasks/today");
        break;
      case "/login":
        replace("/tasks");
        break;
      case "/tasks":
        replace("/tasks/today");
        break;
      default:
        replace("/welcome");
        break;
    }
  }

  function alwaysFail() {
    return false;
  }

  async function initApp() {
    // Check internet connection
    if (navigator.onLine) {
      console.log("Online");
    } else {
      console.log("Offline");
    }

    // Check if PWA is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("PWA is installed");
    } else {
      console.log("PWA is not installed");
    }

    // Check authentication

    // Initialise databases
    initUserDb();
  }

  onMount(async () => {
    // Initialize onlineStatus
    if (navigator.onLine) {
      onlineStatus = true;
    } else {
      onlineStatus = false;
    }
  });
</script>

{#await initApp()}
  <p>Loading...</p>
{:then _}
  <Router
    routes={{
      // Exact paths
      "/": wrap({
        component: Tasks,
        conditions: [alwaysFail],
      }),
      "/tasks": wrap({
        component: Tasks,
        conditions: [alwaysFail],
      }),
      "/tasks/:scope": wrap({
        component: Tasks,
        conditions: [setup],
      }),
      "/tasks/editor/:taskId": wrap({
        component: TaskEditor,
        conditions: [setup],
      }),
      "/login": wrap({
        component: Login,
        conditions: [notSetup],
      }),
      "/welcome": wrap({
        component: Welcome,
        // conditions: [notSetup],
      }),

      // Catch-all (must be the last)
      "*": NotFound,
    }}
    on:conditionsFailed={conditionsFailed}
  />
{/await}
