// basic http server
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Gnerate database connection string from environment variables
	connectionString := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PORT"))

	// Open connection to database
	db, err := gorm.Open(postgres.Open(connectionString))
	if err != nil {
		fmt.Println(err)
		fmt.Println("failed to connect database")
		// exponential backoff-retry
		for {
			db, err = gorm.Open(postgres.Open(connectionString))
			if err == nil {
				break
			}
			time.Sleep(2 * time.Second)
		}
	}
	fmt.Println("connected to database")

	// Migrate the schema
	db.AutoMigrate(&Task{})

	// Register routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			getTasks(w, r, db)
		case "POST":
			createTask(w, r, db)
		case "PUT":
			updateTask(w, r, db)
		case "DELETE":
			deleteTask(w, r, db)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	http.ListenAndServe(":80", nil)
}
