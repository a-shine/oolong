import PouchDb from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";
import PouchDbAuth from "pouchdb-authentication";
import { replaceWrapper } from "./navigatorWrapper";

// Unable to get worker-pouch to work. Lack of maintenance, does not support
// pouch-find, unable to add to service worker generated file.
// Repo: https://github.com/pouchdb-community/worker-pouch

PouchDb.plugin(PouchDBFind);
PouchDb.plugin(PouchDbAuth);

let remoteCouch;
export let localTasksDb;

async function isSeshAuth(): Promise<boolean> {
  const response = await authDb.getSession();
  return response.userCtx.name ? true : false;
}

async function isNotAuth(): Promise<boolean> {
  return !(await isSeshAuth());
}

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

async function getActiveUser(remoteDb: PouchDB.Database<{}>): Promise<string> {
  const response = await remoteDb.getSession();
  return response.userCtx.name;
}

export async function getActiveUserDatabaseName(): Promise<string> {
  const activeUser = await getActiveUser(authDb);
  return getUserDatabaseName(activeUser);
}

export const authDb = new PouchDb(import.meta.env.VITE_COUCH_URL, {
  skip_setup: true,
});

export let userDb;

// list all indexedDB databases
async function listDatabases(): Promise<string[]> {
  return indexedDB.databases().then((dbs) => {
    return dbs.map((db) => db.name);
  });
}

// check if pouuchdb databases exist
async function pouchUserDatabaseExists() {
  // any database starting with _pouch_ followed by any characters
  const dbs = await listDatabases();
  return dbs.some((db) => db.match(/^_pouch_.*/));
}

async function pouchUserDatabaseNotExists() {
  return !(await pouchUserDatabaseExists());
}

export function setup(): boolean {
  return localStorage.getItem("userDbName") !== null;
}

export function notSetup(): boolean {
  return !setup();
}

export async function getUserMetaData() {
  //  TODO: Will requires some middleware backend service to query _user db with
  //  admin credentials for extra user metadata
}

export async function initUserDb() {
  // Get DB name from storage
  let userDbName = localStorage.getItem("userDbName");

  if (!userDbName) {
    console.log("No userDbName found in localStorage, please sign in first.");
    return;
  }

  userDb = new PouchDb(userDbName + "-tasks");

  userDb.createIndex({
    index: {
      fields: ["dueOn", "listOrder"],
    },
  });

  userDb.createIndex({
    index: {
      fields: ["completedAt"],
    },
  });

  userDb.createIndex({
    index: {
      fields: ["listOrder"],
    },
  });

  // Sync between the local and remote user database
  userDb.sync(import.meta.env.VITE_COUCH_URL + userDbName + "-tasks", {
    live: true,
    retry: true,
    skip_setup: true,
  });
}

export async function logout() {
  await authDb.logOut(); // TODO: may need to do this in web worker
  localStorage.removeItem("userDbName");
  localStorage.removeItem("_pouch_check_localstorage");
  // Delete the pouchdb database
  userDb.destroy();
  replaceWrapper("/welcome");
}
