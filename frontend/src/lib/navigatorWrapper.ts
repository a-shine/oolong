import { push, pop, replace } from "svelte-spa-router";
import { writable } from "svelte/store";

// if the page was pushed to, then add a back button to the app bar
export const backButton = writable(
  parseInt(localStorage.getItem("backCount")) || 0
);

backButton.subscribe((val) =>
  localStorage.setItem("backCount", val.toString())
);

export function pushWrapper(path: string) {
  backButton.update((n) => n + 1);
  push(path);
}

export function popWrapper() {
  backButton.update((n) => n - 1);
  pop();
}

export function replaceWrapper(path: string) {
  backButton.set(0);
  replace(path);
}
