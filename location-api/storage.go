package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

type Storage interface {
	InsertTelemetryData(payload TelemetryPayload) error
	CreateTrip() (int, error)
	EndTrip(tripID int) error
}

type PostgresStorage struct {
	db *sql.DB
}

func NewPostgresStorage() (*PostgresStorage, error) {
	const dbConfig = "host=localhost port=5432 user=postgres password=mysecretpassword dbname=tracker_db sslmode=disable"
	db, err := sql.Open("postgres", dbConfig)

	if err != nil {
		log.Fatal("Failed to open a DB connection: ", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping the database (is Docker running?): ", err)
	}

	fmt.Println("✅ Successfully connected to PostgreSQL!")
	return &PostgresStorage{
		db: db,
	}, nil
}

func (s *PostgresStorage) InsertTelemetryData(payload TelemetryPayload) error {
	sqlStatement := `
		INSERT INTO telemetry (trip_id, latitude, longitude, altitude_meters, speed_mps)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`

	var insertedID int

	err := s.db.QueryRow(
		sqlStatement,
		payload.TripID,
		payload.Latitude,
		payload.Longitude,
		payload.AltitudeMeters,
		payload.SpeedMPS,
	).Scan(&insertedID)

	return err
}

func (s *PostgresStorage) CreateTrip() (int, error) {
	// This creates a new row using the default timestamp and leaves the other fields null
	sqlStatement := `
		INSERT INTO trips DEFAULT VALUES
		RETURNING id`

	var insertedID int

	err := s.db.QueryRow(sqlStatement).Scan(&insertedID)
	
	if err != nil {
		log.Printf("Error creating trip: %v\n", err)
	}

	return insertedID, err
}

func (s *PostgresStorage) EndTrip(tripID int) error {
	// This updates the existing row, setting the end_time to exactly right now.
	// (Distance and efficiency calculations can be added to this query later!)
	sqlStatement := `
		UPDATE trips 
		SET end_time = CURRENT_TIMESTAMP 
		WHERE id = $1`

	_, err := s.db.Exec(sqlStatement, tripID)
	
	if err != nil {
		log.Printf("Error ending trip %d: %v\n", tripID, err)
	}

	return err
}

func (s *PostgresStorage) Close() {
	s.db.Close()
	log.Println("Database connection closed")
}