- [ ] Break tasks into componnents
- [ ] Final PWA feature would be to enable push notifications for timely tasks (i.e. when they have a time associated) - I don't actually need service side (push) notifications (cause the app is offline first) - instead simply use the notification API which works independently of the viewport anyway and hence doesn't need to be configured through the sw
      (https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
      https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Re-engageable_Notifications_Push
- [ ] Final PWA feature would be to enable push notifications for timely tasks (i.e. when they have a time associated)

https://css-tricks.com/vitepwa-plugin-offline-service-worker/ - ability to add custome scripts if needed

Design decision

- As we are offline-first, we read/write to the IndexDB first when creating new tasks
- If online we also add the task to the cloud DB via the API
- Store pending (toSync) tasks ids in a different table and sync them when a connection becomes available (using the background sync API)
- Custom sync logic (using lastOnlineDate state) to only sync new content to the local app without re-downloading the whole db

- Offline-first resources - https://github.com/pazguille/offline-first
- SyncedDB lib for indexedDB - https://github.com/paldepind/synceddb#how-is-it-different (not updated in a while)
- Incomplete logic - https://offering.solutions/blog/articles/2018/11/21/online-and-offline-sync-with-angular-and-indexeddb/
- Custom service worker script vitePWA - https://css-tricks.com/vitepwa-plugin-offline-service-worker/ (this would be use to enable background sync which in turn would allow syncing of pending tasks in the background)
- Background sync email example - https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs
- https://neighbourhood.ie/blog/2019/05/10/an-offline-first-todo-list-with-svelte-pouchdb-and-couchdb/ - svelte/pouchdb implementation

don't change the way I store date and time its is actually the best way (as it allows the app to readust to different timezones) BUT do allow for re-ordering tasts that are on the same day

// FEATURE: Want to handle toggle completed tasks a little differently:
// - make completed tasks a new separate scope (like today, upcoming, unassigned)
// - have a button to see completed tasks specific to the today scope (so we get a sense of what we've achieved today)

// tracking deletion is a bit more complicated - we either need to keep track of all devices and queue the deletion so that each delete is sent to every node
// or we can implement logical deletion by having a deleted flag on the task (this is not optimal as the database will be overgrowing but may be the easiest solution)
