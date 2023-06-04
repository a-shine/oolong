# Oolong

## Getting started

Oolong is a simple task manager with one interface that works on all platform by
using PWA technology. The stack is fully open source and you can self-host the
webapp nginc server and CouchDB database.

On a server simply run the following commands:

```bash
docker compose -f docker-compose.yml - docker-compose.self-host.yml up -d
```
Make sure to set the `COUCHDB_USER` and `COUCHDB_PASSWORD` environment variables
and the `COUCHDB_HOST` and `COUCHDB_PORT` environment variables in the
`docker-compose.self-host.yml` file.

Once the containers are up and running, setup your user account for
authenticating access to the database from the app and setting up the necessary
database by running the user-creation script:

```bash
./user-creation.sh
```

If you would like a self-hosted version with SSL support, you can go check out
the [ssl couchdb]()

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
