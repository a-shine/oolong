package main_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/a-shine/oolong/services/tasks"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	dsn := "host=localhost user=postgres password=postgres dbname=todos_test port=5432 sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&main.Todo{})

	exitCode := m.Run()

	db.Migrator().DropTable(&main.Todo{})
	db.Close()
	
    // Exit with the exit code from the tests
    // This ensures that the program returns a non-zero exit code if any tests fail
    os.Exit(exitCode)
}

func performRequest(r http.Handler, method, path string, body []byte) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(method, path, bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestCreateTodoEndpoint(t *testing.T) {
	router := gin.Default()
	router.POST("/todos", main.CreateTodoEndpoint)

	// Test creating a new todo
	todo := main.Todo{Title: "Test Todo"}
	jsonBody, _ := json.Marshal(todo)
	resp := performRequest(router, "POST", "/todos", jsonBody)

	assert.Equal(t, resp.Code, http.StatusCreated)
	var respTodo main.Todo
	json.NewDecoder(resp.Body).Decode(&respTodo)
	assert.Equal(t, respTodo.Title, todo.Title)

	// Test creating a new todo with invalid JSON
	resp = performRequest(router, "POST", "/todos", []byte(`{"title": "Test Todo"`))
	assert.Equal(t, resp.Code, http.StatusBadRequest)
}

func TestGetTodosEndpoint(t *testing.T) {
	router := gin.Default()
	router.GET("/todos", main.GetTodosEndpoint)

	// Test retrieving all todos
	todo1 := main.Todo{Title: "Test Todo 1"}
	db.Create(&todo1)
	todo2 := main.Todo{Title: "Test Todo 2"}
	db.Create(&todo2)
	resp := performRequest(router, "GET", "/todos", nil)

	assert.Equal(t, resp.Code, http.StatusOK)
	var todos []main.Todo
	json.NewDecoder(resp.Body).Decode(&todos)
	assert.Len(t, todos, 2)

	// Test retrieving an empty list of todos
	db.Delete(&todo1)
	db.Delete(&todo2)
	resp = performRequest(router, "GET", "/todos", nil)
	assert.Equal(t, resp.Code, http.StatusOK)
	json.NewDecoder(resp.Body).Decode(&todos)
	assert.Len(t, todos, 0)
}

func TestGetTodoEndpoint(t *testing.T) {
	router := gin.Default()
	router.GET("/todos/:id", main.GetTodoEndpoint)

	// Test retrieving a single todo
	todo := main.Todo{Title: "Test Todo"}
	db.Create(&todo)
	resp := performRequest(router, "GET", "/todos/"+strconv.Itoa(int(todo.ID)), nil)

	assert.Equal(t, resp.Code, http.StatusOK)
	var respTodo main.Todo
	json.NewDecoder(resp.Body).Decode(&respTodo)
	assert.Equal(t, respTodo.ID, todo.ID)

	// Test retrieving a non-existent todo
	resp
}