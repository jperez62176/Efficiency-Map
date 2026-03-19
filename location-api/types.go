package main

type TelemetryPayload struct {
	TripID         int      `json:"trip_id"`
	Latitude       float64  `json:"latitude"`
	Longitude      float64  `json:"longitude"`
	AltitudeMeters *float64 `json:"altitude_meters"` // Pointer allows this to be null
	SpeedMPS       *float64 `json:"speed_mps"`       // Pointer allows this to be null
}