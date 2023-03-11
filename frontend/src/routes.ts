import Login from "./Login.svelte";
import Tasks from "./Tasks.svelte";
import NotFound from "./NotFound.svelte";

export const routes = {
  // Exact path
  "/": Tasks,
  "/login": Login,

  // Catch-all (optional, but if present must be the last)
  "*": NotFound,
};
