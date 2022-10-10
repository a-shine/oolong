package main

import (
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Id         int    `json:"id"`
	Content    string `json:"content"`
	CreatedAt  string `json:"createdAt"`
	DueOn      string `json:"dueOn"`
	Reacurence int    `json:"reacurence"`
	Complete   bool   `json:"complete"`
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

func updateTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	db.Save(&task)
	json.NewEncoder(w).Encode(task)
}

func deleteTask(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var task Task
	json.NewDecoder(r.Body).Decode(&task)
	db.Delete(&task)
	json.NewEncoder(w).Encode(task)
}
