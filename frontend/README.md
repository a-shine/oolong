# Oolong frontend

> Opinionated organisation tool

In order to correctly run the PWA you need to first build all the assests

```bash
npm run build
```

Then start a webserver within the build directory

```bash
python3 -m http.server
```

Testing the PWA functionality e.g. caching, background sync doesn't seem to work very well in the deb mode so best to use build and run using an http server

When developing make sure to clear the browser indexedDB, lastSynced storage value and service worker when making changes as they affect the syncing functionality
