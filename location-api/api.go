package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type APIServer struct {
	listenAddr string
	store      Storage
}

func NewAPIServer(listenAddr string, store Storage) *APIServer {
	return &APIServer{
		listenAddr: listenAddr,
		store:      store,
	}
}

func (s *APIServer) Run() {
	router := mux.NewRouter()

	router.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		response := map[string]string{
			"status":   "healthy",
			"database": "connected",
		}
		json.NewEncoder(w).Encode(response)
	}).Methods("GET")

	router.HandleFunc("/api/telemetry", func(w http.ResponseWriter, r *http.Request) {
		var payload TelemetryPayload
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
			return
		}
		if err = s.store.InsertTelemetryData(payload); err != nil {
			http.Error(w, "Error: "+err.Error(), http.StatusInternalServerError)
			return
		} else {
			log.Printf("Received telemetry for trip %d: lat=%.6f, lon=%.6f\n", payload.TripID, payload.Latitude, payload.Longitude)
			w.WriteHeader(http.StatusCreated)
		}
	}).Methods("POST")

	router.HandleFunc("/api/trips", func(w http.ResponseWriter, r *http.Request) {
		// Call the storage function we just created
		tripID, err := s.store.CreateTrip()
		if err != nil {
			http.Error(w, "Error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Return the new trip ID to the React app
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "success",
			"message": "Trip started",
			"trip_id": tripID,
		})
	}).Methods("POST")

	router.HandleFunc("/api/trips/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		tripIDStr := vars["id"]

		tripID, err := strconv.Atoi(tripIDStr)
		if err != nil {
			http.Error(w, "Invalid trip ID format", http.StatusBadRequest)
			return
		}

		// 1. Fetch all telemetry records for this trip
		records, err := s.store.GetTripTelemetry(tripID)
		if err != nil {
			http.Error(w, "Failed to retrieve trip data for scoring", http.StatusInternalServerError)
			return
		}

		// 2. Calculate the final score
		finalScore := calculateEfficiencyScore(records)

		if err = s.store.EndTrip(tripID, finalScore); err != nil {
			http.Error(w, "Error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK) // 200 OK
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "success",
			"message": fmt.Sprintf("Trip %d successfully ended", tripID),
			"score":   finalScore,
		})
	}).Methods("PUT")

	router.HandleFunc("/api/trips/{id}/telemetry", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		tripIDStr := vars["id"]

		tripID, err := strconv.Atoi(tripIDStr)
		if err != nil {
			http.Error(w, "Invalid trip ID format", http.StatusBadRequest)
			return
		}

		// Fetch the array of records
		records, err := s.store.GetTripTelemetry(tripID)
		if err != nil {
			log.Printf("Error fetching telemetry for trip %d: %v\n", tripID, err)
			http.Error(w, "Failed to retrieve telemetry data", http.StatusInternalServerError)
			return
		}

		// Return the JSON array
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(records)
	}).Methods("GET")

	// GET /api/trips - Returns a summary of all recorded trips
	router.HandleFunc("/api/trips", func(w http.ResponseWriter, r *http.Request) {
		trips, err := s.store.GetAllTrips()
		if err != nil {
			log.Printf("Error fetching all trips: %v\n", err)
			http.Error(w, "Failed to retrieve trips", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(trips)
	}).Methods("GET")

	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:5173", "https://efficiency-tracker-jet.vercel.app"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Accept", "ngrok-skip-browser-warning"}),
	)

	fmt.Println("🚀 API Server is running on http://localhost:", s.listenAddr)

	http.ListenAndServe(s.listenAddr, cors(router))
}
