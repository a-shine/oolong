#!/bin/bash

read -p "CouchDB Host (e.g., http://localhost:5984): " COUCHDB_HOST
read -p "Admin Username: " ADMIN_USERNAME
read -s -p "Admin Password: " ADMIN_PASSWORD
echo

read -p "New User Username: " USERNAME
read -s -p "New User Password: " PASSWORD
echo

# Create the user document
USER_DOC='{"_id": "org.couchdb.user:'$USERNAME'", "name": "'$USERNAME'", "password": "'$PASSWORD'", "roles": ["member", "admin"], "type": "user"}'

# Send a POST request to create the user document
curl -X POST -H "Content-Type: application/json" -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" -d "$USER_DOC" "$COUCHDB_HOST/_users"

# Create user tasks database
USER_DATABASE="userdb-$(echo -n "$USERNAME" | xxd -p)-tasks"
curl -X PUT -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" "$COUCHDB_HOST/$USER_DATABASE"

# Assign user as a member and administrator of the user database
MEMBER_DOC='{"admins": {"names": ["'$USERNAME'"], "roles": ["_admin"]}, "members": {"names": ["'$USERNAME'"], "roles": ["_admin"]}}'
curl -X PUT -H "Content-Type: application/json" -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" -d "$MEMBER_DOC" "$COUCHDB_HOST/$USER_DATABASE/_security"

# Print the response
echo "User created successfully."
echo "User database '$USER_DATABASE' created."
echo "User '$USERNAME' is now a member and administrator of the database."
