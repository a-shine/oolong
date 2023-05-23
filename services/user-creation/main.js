require("dotenv").config();
const nano = require("nano")(process.env.COUCHDB_URL);
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

nano.auth(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD);

const userDb = nano.use("_users");

// Requires admin privileges to create a user (I think)
function createUser(username, password, firstName, lastName, preferredName) {
  const user = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
    preferredName: preferredName,
    roles: [],
    type: "user",
  };

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

readline.question(`New user email: `, (email) => {
  readline.question(`New user password: `, (pwd) => {
    readline.question(`New user first name: `, (firstName) => {
      readline.question(`New user last name: `, (lastName) => {
        readline.question(`New user preferred name: `, (preferredName) => {
          createUser(email, pwd, firstName, lastName, preferredName);
          readline.close();
        });
      });
    });
  });
});
