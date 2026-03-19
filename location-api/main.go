package main

import (
	"log"

	_ "github.com/lib/pq" // The underscore imports the driver anonymously so it registers with database/sql
)

// Connection string matching your Docker Compose setup
const dbConfig = "host=localhost port=5432 user=postgres password=mysecretpassword dbname=tracker_db sslmode=disable"

func main() {
	store, err := NewPostgresStorage()
	if err != nil {
		log.Fatal(err)
	}
	defer store.Close()
	port := "8080"
	server := NewAPIServer(":"+port, store)

	server.Run()

}