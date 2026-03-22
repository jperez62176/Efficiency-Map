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
	EndTrip(tripID int, score float64) error
	GetTripTelemetry(tripID int) ([]TelemetryRecord, error)
	GetAllTrips() ([]TripSummary, error)
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

func (s *PostgresStorage) EndTrip(tripID int, score float64) error {
	// This updates the existing row, setting the end_time to exactly right now.
	// (Distance and efficiency calculations can be added to this query later!)
	sqlStatement := `
		UPDATE trips 
		SET end_time = CURRENT_TIMESTAMP, efficiency_score = $2 
		WHERE id = $1`

	_, err := s.db.Exec(sqlStatement, tripID, score)

	if err != nil {
		log.Printf("Error ending trip %d: %v\n", tripID, err)
	}

	return err
}

func (s *PostgresStorage) GetAllTrips() ([]TripSummary, error) {
	query := `
		SELECT id, start_time, end_time, total_distance_meters, efficiency_score
		FROM trips
		ORDER BY start_time DESC`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Initialize as an empty slice so it returns [] instead of null if the database is empty
	trips := []TripSummary{}

	for rows.Next() {
		var t TripSummary
		err := rows.Scan(
			&t.ID,
			&t.StartTime,
			&t.EndTime,
			&t.TotalDistanceMeters,
			&t.EfficiencyScore,
		)
		if err != nil {
			return nil, err
		}
		trips = append(trips, t)
	}

	return trips, nil
}

func (s *PostgresStorage) Close() {
	s.db.Close()
	log.Println("Database connection closed")
}

func (s *PostgresStorage) GetTripTelemetry(tripID int) ([]TelemetryRecord, error) {
	// The ORDER BY clause guarantees your frontend line charts will draw sequentially
	query := `
		SELECT id, trip_id, latitude, longitude, altitude_meters, speed_mps, recorded_at
		FROM telemetry
		WHERE trip_id = $1
		ORDER BY recorded_at ASC`

	rows, err := s.db.Query(query, tripID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Initialize with an empty slice so it returns [] in JSON instead of null if empty
	records := []TelemetryRecord{}

	for rows.Next() {
		var r TelemetryRecord
		err := rows.Scan(
			&r.ID,
			&r.TripID,
			&r.Latitude,
			&r.Longitude,
			&r.AltitudeMeters,
			&r.SpeedMPS,
			&r.RecordedAt,
		)
		if err != nil {
			return nil, err
		}
		records = append(records, r)
	}

	return records, nil
}
