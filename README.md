# Oolong

> Simple, opinionated task manager.

## Installation

The app is available as a Progressive Web App (PWA) at
[a-shine.github.io/oolong/](https://a-shine.github.io/oolong/).

As PWA features are not implemented consistently across browsers, it is
recommended to use Google Chrome (both on desktop and mobile). On mobile devices
a modal will be displayed on first viewing to allow the user to add the app to
their home screen.

## Design

The app should be as simple and quick to use as possible to allow users to get
on with their tasks rather than spend time managing them. As an exercise to
promote thoughtful design, each usability level feature is logged in the
[Oolong project board](https://github.com/users/a-shine/projects/5).

Technical decisions are documented in the code.

## About PWAs

Progressive Web Apps (PWAs) are web applications that are installable and work
offline. They are built using web technologies such as HTML, CSS and JavaScript
and can be delivered through the web, installed on the user's home screen, and
work offline.

As an app developer, they have the advantage of being able to use the same code
base for both the web and mobile platforms. As a user, they have the advantage
of being able to install the app on their home screen and use it offline thanks
to the service worker.

### PWA limitations

Poor support for PWA features across browsers means that the app may not work as
expected.

Offline scheduled push notifications are not supported at all as captured in
[Chromium Issue 891339](https://bugs.chromium.org/p/chromium/issues/detail?id=891339#c79).
This means that the app will not be able to notify the user of tasks that are
due at a specific time unless it is a server side push notification (which
requires internet access). Frustratingly, by the sound of it, this is unlikely
to be supported in the near future.

## Development

<!-- TODO: Complete the development part of the README -->

### Resources

- [Offline-first web application resource review](https://github.com/pazguille/offline-first)
- [Tutorial on using `VitePWA` plugin](https://css-tricks.com/vitepwa-plugin-offline-service-worker)
- [Background sync email example](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs)
- [Svelte PouchDB/CouchDB tutorial](https://neighbourhood.ie/blog/2019/05/10/an-offline-first-todo-list-with-svelte-pouchdb-and-couchdb/)
