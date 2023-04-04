package main

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

type Task struct {
    Id           string    `gorm:"primaryKey" json:"id"`
    ProjectLabel string    `json:"projectLabel"`
    Description  string    `json:"description"`
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`
    DueOn        time.Time `json:"dueOn"`
    DueAt        time.Time `json:"dueAt"`
    Recurrence   int       `json:"recurrence"`
    Lane         string    `json:"lane"`      // 'active' | 'in progress' | 'bug'/'feature'
    ListOrder    int       `json:"listOrder"`
    LaneOrder    int       `json:"laneOrder"`
    CompletedAt  time.Time `json:"completedAt"`
}

var db *gorm.DB

func main() {
    // Initialize database
    var err error
    db, err = gorm.Open(sqlite.Open("tasks.db"), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }

    // AutoMigrate the Task model
    err = db.AutoMigrate(&Task{})
    if err != nil {
        panic("failed to migrate database")
    }

    // Initialize Gin router
    r := gin.Default()

    // Routes
    r.GET("/tasks", listTasks)
    r.GET("/tasks/:id", getTask)
    r.POST("/tasks", createTask)
    r.PUT("/tasks/:id", updateTask)
    r.DELETE("/tasks/:id", deleteTask)

    // Start server
    r.Run()
}

func listTasks(c *gin.Context) {
    var tasks []Task
    db.Find(&tasks)
    c.JSON(http.StatusOK, tasks)
}

func getTask(c *gin.Context) {
    id := c.Param("id")
    var task Task
    db.First(&task, id)
    if task.Id == "" {
        c.AbortWithStatus(http.StatusNotFound)
        return
    }
    c.JSON(http.StatusOK, task)
}

func createTask(c *gin.Context) {
    var task Task
    err := c.BindJSON(&task)
    if err != nil {
        c.AbortWithStatus(http.StatusBadRequest)
        return
    }
    db.Create(&task)
    c.JSON(http.StatusCreated, task)
}

func updateTask(c *gin.Context) {
    id := c.Param("id")
    var task Task
    db.First(&task, id)
    if task.Id == "" {
        c.AbortWithStatus(http.StatusNotFound)
        return
    }
    err := c.BindJSON(&task)
    if err != nil {
        c.AbortWithStatus(http.StatusBadRequest)
        return
    }
    db.Save(&task)
    c.JSON(http.StatusOK, task)
}

func deleteTask(c *gin.Context) {
    id := c.Param("id")
    var task Task
    db.First(&task, id)
    if task.Id == "" {
        c.AbortWithStatus(http.StatusNotFound)
        return
    }
    db.Delete(&task)
    c.Status(http.StatusOK)
}
