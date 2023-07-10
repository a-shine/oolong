import { writable } from "svelte/store";

// Create a writable store
export const reloadStore = writable();

// Function to trigger the reload
export function triggerReload() {
  reloadStore.set({});
}
