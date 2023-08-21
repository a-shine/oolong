# Oolong

With Oolong Tasks the idea is to enable a simple tasks workflow. What matters to
getting through tasks is not necessarily when they are due but when you want to
find the time to complete them. So the idea is to scope visibility of tasks to
solely the tasks to be completed today (with a reminder to complete overdue
tasks as well). This way, you can focus on what you need to do today and not be
overwhelmed by what is due in the future or has not been assigned a date yet.

For psychological safety you can add tasks unassigned to a day, and they will
be visible to remind that you intend to complete them. You can set tasks to be
completed in the future, in the comfort that they will appear on the day you
have allocated to them.

If an action needs to be taken on a particular day and takes a
particular amount of time, it should not be a task but an event in your
calendar.

## Features

- [x] Create, edit and delete tasks both offline and online
- [x] Plan for tasks to be completed on specified days (not when the task is due
  but when you want to complete it)
- [x] Today task view to focus on tasks that you want to complete today
- [x] Completed task view to see what tasks have been completed historically
- [x] Ability to re-order tasks on the day to reflect priorities
- [x] Offline-first PWA cross-platform support

## Getting started

Oolong works on all platforms by using Progressive Web App (PWA) technology. The
stack (Svelte + PouchDB + CouchDB) is fully open source, and can be and can be
self-hosted.



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
