package main

import (
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Id         int
	Content    string
	CreatedAt  string
	DueOn      string
	Reacurence int
	Complete   bool
}

func getTasks(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var tasks []Task
	db.Find(&tasks)
	json.NewEncoder(w).Encode(tasks)
}

func createTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	db.Create(&task)
	json.NewEncoder(w).Encode(task)
}
