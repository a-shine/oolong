package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"gorm.io/gorm"
)

type Task struct {
	Id         int       `gorm:"primaryKey" json:"id"`
	Content    string    `gorm:"not null" json:"content"`
	CreatedAt  time.Time `gorm:"not null" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"not null" json:"updatedAt"`
	DueOn      time.Time `json:"dueOn"`
	Reacurence int       `gorm:"not null" json:"reacurence"`
	Complete   bool      `gorm:"not null" json:"complete"`
	Deleted    bool      `gorm:"not null" json:"-"` // the "-" prevents returning the value in the api json as it is an artifact of the syncing logical delete and not relevant to the user// logical delete implementation - do not download deleted Tasks locally, and every month remove all deleted tasks (every so often ask client to do a full refreh of the tasks in order to avoid drift from clients that aren't often used)
}

func getTasks(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	db.Where("NOT deleted").Find(&tasks)
	json.NewEncoder(w).Encode(tasks)
}

type LastSynced struct {
	LastSynced string `json:"lastSynced"`
}

// You can avoid deleting tasks off the db - if they are removed they can just be moved into a different table

func updatedSinceSync(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	var lastSynced string
	// see request body
	data, _ := ioutil.ReadAll(r.Body)
	// fmt.Println(string(data))
	// // json.NewDecoder(r.Body).Decode(&lastSynced)
	// // fmt.Println(string(r.Body)) // BUG: Not understanding the ISO string
	// // parse the ISO string to a time.Time

	// Get the lastSynced value from the request body
	// json.NewDecoder(r.Body).Decode(&lastSynced)

	// Get the lastSynced value from the request body
	// json.Unmarshal(, &lastSynced)
	// fmt.Println(lastSynced)

	res := make(map[string]interface{})
	json.Unmarshal(data, &res)
	fmt.Println(res["lastSynced"])
	lastSynced = res["lastSynced"].(string) // should i convert to time or not?

	// convert the ISO string to a time.Time
	lastSyncedTime, _ := time.Parse(time.RFC3339, lastSynced)

	fmt.Println(lastSyncedTime)

	// fmt.Println(lastSynced)
	db.Where("updated_at > ? AND NOT deleted", lastSyncedTime).Find(&tasks)
	json.NewEncoder(w).Encode(tasks)
}

func deletedSinceSync(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	var lastSynced string
	// see request body
	data, _ := ioutil.ReadAll(r.Body)
	// fmt.Println(string(data))
	// // json.NewDecoder(r.Body).Decode(&lastSynced)
	// // fmt.Println(string(r.Body)) // BUG: Not understanding the ISO string
	// // parse the ISO string to a time.Time

	// Get the lastSynced value from the request body
	// json.NewDecoder(r.Body).Decode(&lastSynced)

	// Get the lastSynced value from the request body
	// json.Unmarshal(, &lastSynced)
	// fmt.Println(lastSynced)

	res := make(map[string]interface{})
	json.Unmarshal(data, &res)
	fmt.Println(res["lastSynced"])
	lastSynced = res["lastSynced"].(string) // should i convert to time or not?

	// convert the ISO string to a time.Time
	lastSyncedTime, _ := time.Parse(time.RFC3339, lastSynced)

	fmt.Println(lastSyncedTime)

	// fmt.Println(lastSynced)
	db.Where("updated_at > ? AND deleted", lastSyncedTime).Find(&tasks)
	json.NewEncoder(w).Encode(tasks)
}

func createTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	if task.Id == 0 {
		// TODO: generate the uuid server side
		// else let the client use a valid generated uuid
	}
	db.Create(&task)
	json.NewEncoder(w).Encode(task)
}

func updateTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	db.Save(&task)
	json.NewEncoder(w).Encode(task)
}

func deleteTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	task.Deleted = true
	db.Save(&task) // don't actually delete the task, just mark it as deleted (logical delete)
	json.NewEncoder(w).Encode(task)
}

// regular task cleanup - remove all tasks that are marked as deleted (maybe monthly or yearly)
