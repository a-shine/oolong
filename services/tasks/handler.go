package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	Id         string     `gorm:"primaryKey" json:"id"`
	Content    string     `gorm:"not null" json:"content"`
	CreatedAt  time.Time  `gorm:"not null" json:"createdAt"`
	UpdatedAt  time.Time  `gorm:"not null" json:"updatedAt"`
	DueOn      *time.Time `gorm:"not null" json:"dueOn"` // pointer so that it can be null
	Reacurence int        `gorm:"not null" json:"reacurence"`
	Complete   bool       `gorm:"not null" json:"complete"`
	Deleted    bool       `gorm:"not null" json:"-"` // the "-" prevents returning the value in the api json as it is an artifact of the syncing logical delete and not relevant to the user// logical delete implementation - do not download deleted Tasks locally, and every month remove all deleted tasks (every so often ask client to do a full refreh of the tasks in order to avoid drift from clients that aren't often used)
}

func getTasks(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	db.Where("NOT deleted").Find(&tasks)
	json.NewEncoder(w).Encode(tasks)
}

type LastSyncedPayload struct {
	LastSynced string `json:"lastSynced"`
}

func updatedSinceSync(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	var lastSynced LastSyncedPayload

	json.NewDecoder(r.Body).Decode(&lastSynced)

	fmt.Println(lastSynced.LastSynced)

	db.Where("updated_at > ? AND NOT deleted", lastSynced.LastSynced).Find(&tasks)

	json.NewEncoder(w).Encode(tasks)
}

func deletedSinceSync(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	var lastSynced LastSyncedPayload

	json.NewDecoder(r.Body).Decode(&lastSynced)

	db.Where("updated_at > ? AND deleted", lastSynced.LastSynced).Find(&tasks)

	json.NewEncoder(w).Encode(tasks)
}

func createTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	if task.Id == "" {
		task.Id = uuid.New().String()
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
