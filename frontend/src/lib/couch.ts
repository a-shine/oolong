import PouchDb from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";
import PouchDbAuth from "pouchdb-authentication";
import {replaceWrapper} from "./navigatorWrapper";
import {v4 as uuidv4} from "uuid";
import {triggerReload} from "./reloadStore";

// Unable to get worker-pouch to work. Lack of maintenance, does not support
// pouch-find, unable to add to service worker generated file.
// Repo: https://github.com/pouchdb-community/worker-pouch

PouchDb.plugin(PouchDBFind);
PouchDb.plugin(PouchDbAuth);

export class Workspace {
    _id: string;
    _rev?: string; // revision number created by pouchdb/couchdb
    name: string;
    createdAt: number;
    updatedAt: number;
}


export let taskDb;
export let workspaceDb;

/**
 * @returns Promise<Workspace[]> of all workspaces in the user's workspace pouchdb
 */
export async function getWorkspaces(): Promise<Workspace[]> {
    const workspaceQuery = await workspaceDb.allDocs({include_docs: true});
    return workspaceQuery.rows.map((row) => row.doc);
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
    return await workspaceDb.get(workspaceId);
}

/**
 * Update workspace name in the user's workspace pouchdb
 * @param workspaceId
 * @param newName
 * @returns Promise<Workspace> of the updated workspace
 */
export async function updateWorkspaceName(workspaceId: string, newName: string): Promise<Workspace> {
    const workspace = await workspaceDb.get(workspaceId);
    workspace.name = newName;
    workspace.updatedAt = Date.now();
    return await workspaceDb.put(workspace);
}

/**
 * Delete workspace from the user's workspace pouchdb
 * @param workspaceId
 * @returns Promise<void> of the deleted workspace
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
    const workspace = await workspaceDb.get(workspaceId);
    await workspaceDb.remove(workspace);
}

/**
 * Create a new workspace in the user's workspace pouchdb
 * @param name
 * @returns Promise<string> of the created workspace
 * @constructor
 */
export async function createWorkspace(name: string): Promise<string> {
    const workspace: Workspace = {
        _id: uuidv4(), name: name, createdAt: Date.now(), updatedAt: Date.now(),
    };
    const result = await workspaceDb.put(workspace);
    return result.id;
}

/**
 * Check if the user is authenticated with the remote database.
 * @returns {boolean} - True if authenticated, false if not.
 */
async function isSessionAuth(): Promise<boolean> {
    const response = await authDb.getSession();
    return !!response.userCtx.name;
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
    const bytes = Array.from(buffy).map((byte) => byte.toString(16).padStart(2, "0"));
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

// BUG: Find way to include/pre-pend full base url to the new PouchDb() constructor as it can't build dynamic urls
export const authDb = new PouchDb(window.location.origin + "/couch/", {
    skip_setup: true,
});

// list all indexedDB databases
async function listDatabases(): Promise<string[]> {
    return indexedDB.databases().then((dbs) => {
        return dbs.map((db) => db.name);
    });
}

// check if pouchdb databases exist
async function pouchUserDatabaseExists() {
    // any database starting with _pouch_ followed by any characters
    const dbs = await listDatabases();
    return dbs.some((db) => db.match(/^_pouch_.*/));
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

export async function getFirstWorkspaceId(): Promise<string> {
    const result = await workspaceDb.allDocs({limit: 1});
    return result.rows[0].id;
}

// function to create a user workspace database hosting a list of workspaces with ids that can be referenced by tasks
export async function createUserWorkspaceDatabase() {

}

export async function initUserDb() {
    console.log("Initializing user database");
    // Get DB name from storage
    let userDbName = localStorage.getItem("userDbName");

    if (!userDbName) {
        console.log("No userDbName found in localStorage, please sign in first.");
        return;
    }

    // Assume that as users is already signed in that most of the data is already synced
    // FIXME: may need to change this later

    // settingsDb = new PouchDb(userDbName + "-settings");
    workspaceDb = new PouchDb(userDbName + "-workspaces");
    taskDb = new PouchDb(userDbName + "-tasks");

    console.log("User database name: " + userDbName);

    // Add dueOn, ListOrder and createdAt indexes to be able to place new tasks at
    // the top/bottom of the list

    taskDb.createIndex({
        index: {
            fields: ["dueOn", "listOrder"],
        },
    });

    taskDb.createIndex({
        index: {
            fields: ["completedAt"],
        },
    });

    taskDb.createIndex({
        index: {
            fields: ["listOrder"],
        },
    });

    // index for workspaceId
    taskDb.createIndex({
        index: {
            fields: ["workspaceId", "dueOn", "listOrder"],
        }
    });

    // Sync between the local and remote user database
    taskDb.sync(window.location.origin + "/couch/" + userDbName + "-tasks", {
        live: true, retry: true, skip_setup: true,
    });

    console.log("Task sync complete");

    workspaceDb.sync(window.location.origin + "/couch/" + userDbName + "-workspaces", {
        live: true, retry: true, skip_setup: true,
    });

    // query reomote database for all workspaces and add them to the local database
    // FIXME: Remove as this is not needed once all existing users have been migrated to the new database
    const result = await workspaceDb.allDocs();
    if (result.rows.length === 0) {
        console.log("User has no workspaces, creating a default personal workspace");
        // create a personal workspace
        const workspaceId = await createWorkspace("Personal");
        console.log(workspaceId);
    } else {
        console.log("User has workspaces, not creating a default personal workspace");
    }


    taskDb
        .changes({
            since: "now", live: true, include_docs: true,
        })
        .on("change", () => {
            // Trigger redraw of the task list
            triggerReload();
        });

    // TODO: get all completed tasks older than 7 days old and remove them from the database
}

export async function logout(): Promise<void> {
    await authDb.logOut();
    localStorage.removeItem("userDbName");
    // Delete the pouchdb database
    taskDb.destroy();
    replaceWrapper("/");
}
