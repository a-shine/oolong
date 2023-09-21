import PouchDb from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";
import PouchDbAuth from "pouchdb-authentication";
import {replaceWrapper} from "./navigatorWrapper";
import {triggerReload} from "./reloadStore";
import {v4 as uuidv4} from "uuid";

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

const personalWorkspaceId: string = "personal";

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
 * @returns Promise<Workspace> of the created workspace
 * @constructor
 */
export async function createWorkspace(name: string): Promise<Workspace> {
    const workspace: Workspace = {
        _id: uuidv4(),
        name: name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    return await workspaceDb.put(workspace);
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

// function to create a user workspace database hosting a list of workspaces with ids that can be referenced by tasks
export async function createUserWorkspaceDatabase() {

}

export async function initUserDb() {
    // Get DB name from storage
    let userDbName = localStorage.getItem("userDbName");

    if (!userDbName) {
        console.log("No userDbName found in localStorage, please sign in first.");
        return;
    }

    // personal workspace
    // let personalWorkspace: Workspace = {
    //     _id: uuidv4(),
    //     name: "Personal",
    //     createdAt: Date.now(),
    //     updatedAt: Date.now(),
    // };

    // settingsDb = new PouchDb(userDbName + "-settings");
    workspaceDb = new PouchDb(userDbName + "-workspaces");
    // add personal workspace to workspaceDb
    // workspaceDb.put(personalWorkspace);

    taskDb = new PouchDb(userDbName + "-tasks");

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

    // FIXME: Disabled sync for now, to avoid corrupting the prod database
    // Sync between the local and remote user database
    // taskDb.sync(
    //     window.location.origin + "/couch/" + userDbName + "-tasks",
    //     {
    //         live: true,
    //         retry: true,
    //         skip_setup: true,
    //     }
    // );

    // taskDb
    //     .changes({
    //         since: "now",
    //         live: true,
    //         include_docs: true,
    //     })
    //     .on("change", () => {
    //         // Trigger redraw of the task list
    //         triggerReload();
    //     });

    // One time update to add workspaceId to all tasks
    // const tasks = await taskDb.allDocs({include_docs: true});
    // const taskDocs = tasks.rows.map((row) => row.doc);
    // const updatedTaskDocs = taskDocs.map((doc) => {
    //     doc.workspaceId = "14623ca6-b6f0-42e7-8821-7cda1be27e6d";
    //     return doc;
    // });
    // console.log(updatedTaskDocs);
    // taskDb.bulkDocs(updatedTaskDocs);

    // print all tasks
    const tasks = await taskDb.allDocs({include_docs: true});
    // console.log(tasks.rows.map((row) => row.doc));

    // TODO: get all completed tasks older than 7 days old and remove them from the database
}

export async function logout(): Promise<void> {
    await authDb.logOut();
    localStorage.removeItem("userDbName");
    // Delete the pouchdb database
    taskDb.destroy();
    replaceWrapper("/");
}
