require("dotenv").config();
const nano = require("nano")(process.env.COUCHDB_URL);
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

nano.auth(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD);

/**
 * Get the name of the users remote-database.
 * This function uses browser APIs.
 * @param {string} name     - The username.
 * @param {string} [prefix] - Prefix, can be changed with config [couch_peruser]
 * database_prefix
 */
function getUserDatabaseName(name, prefix = "userdb-") {
  const encoder = new TextEncoder();
  const buffy = encoder.encode(name);
  const bytes = Array.from(buffy).map((byte) =>
    byte.toString(16).padStart(2, "0")
  );
  return prefix + bytes.join("");
}

async function setUserDbPermissions(username, userDbName) {
  // retrive
  await nano.request({
    db: userDbName,
    method: "get",
    path: "_security",
  });

  // save
  await nano.request({
    db: userDbName,
    method: "put",
    path: "_security",
    body: {
      admins: { names: [username], roles: ["_admin"] },
      members: { names: [username], roles: ["_admin"] },
    },
  });
}

/**
 * Register new user by creating a new document in the _users database with the
 * user's authentication credentials.
 * @param {string} username
 * @param {string} password
 * @returns {Promise} Resolves with the response from CouchDB.
 */
async function registerUser(username, password) {
  const user = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    password: password,
    roles: [],
    type: "user",
  };

  const userDb = nano.use("_users");

  return new Promise((resolve, reject) => {
    userDb.insert(user, (err, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

/**
 * Create a new database for the user in the CouchDB couch_peruser way.
 * @param {*} username
 * @param {*} firstName
 * @param {*} lastName
 * @param {*} preferredName
 * @returns
 */
async function createUserDb(username, firstName, lastName, preferredName) {
  const userDbName = getUserDatabaseName(username);

  await nano.db.create(userDbName);

  // While the database is does not exist, try and insert a document into it.
  while (true) {
    try {
      await nano.use(userDbName).insert({
        firstName: firstName,
        lastName: lastName,
        preferredName: preferredName,
        dbs: ["tasks"],
      });
      break;
    } catch (err) {
      // wait 2 seconds for the database to be created
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Set permissions for the user
  await setUserDbPermissions(username, userDbName);
}

async function createUserDbs(username) {
  // Get user dbs list
  const userDbName = getUserDatabaseName(username);
  const userDb = nano.use(userDbName);

  // get first doc in user db
  const body = await userDb.list({ include_docs: true });

  for (const db of body.rows[0].doc.dbs) {
    await nano.db.create(`${userDbName}-${db}`);
    await setUserDbPermissions(username, `${userDbName}-${db}`);
  }
}

async function setupUser(
  username,
  password,
  firstName,
  lastName,
  preferredName
) {
  await registerUser(username, password);
  await createUserDb(username, firstName, lastName, preferredName);
  await createUserDbs(username);
}

readline.question(`New user email: `, (email) => {
  readline.question(`New user password: `, (pwd) => {
    readline.question(`New user first name: `, (firstName) => {
      readline.question(`New user last name: `, (lastName) => {
        readline.question(`New user preferred name: `, (preferredName) => {
          setupUser(email, pwd, firstName, lastName, preferredName);
          readline.close();
        });
      });
    });
  });
});
