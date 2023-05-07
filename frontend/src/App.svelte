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
  import TopBar from "./TopBar.svelte";
  import Login from "./Login.svelte";
  import Logout from "./Logout.svelte";
  import Tasks from "./Tasks.svelte";
  import NotFound from "./NotFound.svelte";
  import TaskEditor from "./TaskEditor.svelte";

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

  /**
   * Get the name of the users remote-database.
   * This function uses browser APIs.
   * @param {string} name     - The username.
   * @param {string} [prefix] - Prefix, can be changed with config [couch_peruser] database_prefix
   */
  function getUserDatabaseName(name, prefix = "userdb-") {
    const encoder = new TextEncoder();
    const buffy = encoder.encode(name);
    const bytes = Array.from(buffy).map((byte) =>
      byte.toString(16).padStart(2, "0")
    );
    return prefix + bytes.join("");
  }

  async function getActiveUser(
    remoteDb: PouchDB.Database<{}>
  ): Promise<string> {
    const response = await remoteDb.getSession();
    return response.userCtx.name;
  }

  async function getActiveUserDatabaseName(
    remoteDb: PouchDB.Database<{}>
  ): Promise<string> {
    const activeUser = await getActiveUser(remoteDb);
    return getUserDatabaseName(activeUser);
  }

  // Used for authentication
  const remoteCouch = new PouchDb("http://localhost:5984");

  // We can put all sorts of things in the user db (not only tasks)

  // Need to get name of active user in order to get the correct database

  async function setupDb(): Promise<any> {
    const dbName = await getActiveUserDatabaseName(remoteCouch);
    const pdb = new PouchDb(dbName);
    const remoteDb = new PouchDb("http://localhost:5984/" + dbName, {
      skip_setup: true,
    });

    // Enable syncing
    pdb.sync(remoteDb, { live: true });

    pdb.createIndex({
      index: {
        fields: ["dueOn", "listOrder"],
      },
    });
    pdb.createIndex({
      index: {
        fields: ["completedAt"],
      },
    });
    return pdb;
  }

  async function isAuth(): Promise<boolean> {
    const response = await remoteCouch.getSession();
    return response.userCtx.name ? true : false;
  }

  async function isNotAuth(): Promise<boolean> {
    const response = !(await isAuth());
    return !(await isAuth());
  }

  // Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its
  // pre-condition failed. If the pre-condition failed on a route other than the "/login" route then it must mean that
  // the user is not authenticated and hence we redirect to "/login". If the pre-condition failed on the "/login" route,
  // it means the user must be authenticated and hence the user is redirected to the "/" route.
  function conditionsFailed(event) {
    switch (event.detail.route) {
      case "/login":
        replace("/tasks");
        break;
      default:
        replace("/login");
        break;
    }
  }

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

<TopBar />

<div id="container">
  {#await setupDb() then pdb}
    <Router
      routes={{
        // Exact paths
        "/": wrap({
          component: function () {
            replace("/tasks/today");
          },
          conditions: [isAuth],
        }),
        "/tasks": wrap({
          component: function () {
            replace("/tasks/today");
          },
          conditions: [isAuth],
        }),
        "/tasks/:scope": wrap({
          component: Tasks,
          conditions: [isAuth],
          props: { pdb },
        }),
        "/tasks/editor/:taskId": wrap({
          component: TaskEditor,
          conditions: [isAuth],
          props: { pdb },
        }),
        "/login": wrap({
          component: Login,
          conditions: [isNotAuth],
          props: { remoteCouch },
        }),
        "/logout": wrap({
          component: Logout,
          conditions: [isAuth],
          props: { remoteCouch },
        }),

        // Catch-all (optional, but if present must be the last)
        "*": NotFound,
      }}
      on:conditionsFailed={conditionsFailed}
    />
  {/await}
</div>

<style>
  /* start 50px under the top bar */
  #container {
    position: fixed;
    top: 50px;
    width: 100%;
  }
</style>
