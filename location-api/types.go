package main

import "time"

type TelemetryPayload struct {
	TripID         int      `json:"trip_id"`
	Latitude       float64  `json:"latitude"`
	Longitude      float64  `json:"longitude"`
	AltitudeMeters *float64 `json:"altitude_meters"` // Pointer allows this to be null
	SpeedMPS       *float64 `json:"speed_mps"`       // Pointer allows this to be null
}

type TelemetryRecord struct {
	ID             int       `json:"id"`
	TripID         int       `json:"trip_id"`
	Latitude       float64   `json:"latitude"`
	Longitude      float64   `json:"longitude"`
	AltitudeMeters *float64  `json:"altitude_meters"`
	SpeedMPS       *float64  `json:"speed_mps"`
	RecordedAt     time.Time `json:"recorded_at"`
}

// TripSummary matches a single row from the trips table
type TripSummary struct {
	ID                  int        `json:"id"`
	StartTime           time.Time  `json:"start_time"`
	EndTime             *time.Time `json:"end_time"`
	TotalDistanceMeters *float64   `json:"total_distance_meters"`
	EfficiencyScore     *float64   `json:"efficiency_score"`
}