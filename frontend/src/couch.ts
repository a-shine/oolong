import PouchDb from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";
import PouchDbAuth from "pouchdb-authentication";

PouchDb.plugin(PouchDBFind);
PouchDb.plugin(PouchDbAuth);

async function isAuth(): Promise<boolean> {
  const response = await authDb.getSession();
  return response.userCtx.name ? true : false;
}

async function isNotAuth(): Promise<boolean> {
  return !(await isAuth());
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

export async function initUserDb() {
  // Get DB name from storage
  let userDbName = localStorage.getItem("userDbName");
  if (!userDbName) {
    console.log("No userDbName found in localStorage, please sign in first.");
    return;
  }
  userDb = new PouchDb(userDbName);

  // Try and connect to remote db if possible and sync
  const remoteUserDb = new PouchDb(
    import.meta.env.VITE_COUCH_URL + userDbName,
    {
      skip_setup: true,
    }
  );

  // Sync between the local and remote user specific database
  userDb.sync(remoteUserDb, { live: true });

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
}

// export const localUserDb = new PouchDb("local_user_db", {skip_setup : true});
// export const remoteUserDb = new PouchDb(import.meta.env.VITE_COUCH_URL + "/user_db", {skip_setup : true});
