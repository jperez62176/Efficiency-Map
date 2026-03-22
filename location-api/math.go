package main

import "math"

func calculateEfficiencyScore(records []TelemetryRecord) float64 {
	score := 100.0
	idleSeconds := 0.0

	// If we have less than 2 data points, we can't calculate acceleration
	if len(records) < 2 {
		return score
	}

	for i := 1; i < len(records); i++ {
		prev := records[i-1]
		curr := records[i]

		// Skip if we lost GPS signal and speed is null
		if prev.SpeedMPS == nil || curr.SpeedMPS == nil {
			continue
		}

		// Calculate the time difference in seconds (dt)
		dt := curr.RecordedAt.Sub(prev.RecordedAt).Seconds()
		if dt <= 0 {
			continue // Prevent division by zero if timestamps are identical
		}

		// Calculate acceleration (m/s²)
		acceleration := (*curr.SpeedMPS - *prev.SpeedMPS) / dt

		// Deduct 1 point for hard acceleration (roughly > 5.5 mph per second)
		if acceleration > 2.5 {
			score -= 1.0
		}

		// Deduct 1 point for hard braking
		if acceleration < -2.5 {
			score -= 1.0
		}

		// Track idling (speed less than 0.5 m/s to account for minor GPS drift)
		if *curr.SpeedMPS < 0.5 {
			idleSeconds += dt
		}
	}

	// Deduct 1 point for every minute of idling AFTER a 5-minute grace period
	if idleSeconds > 300 {
		excessIdleMinutes := (idleSeconds - 300) / 60.0
		score -= excessIdleMinutes
	}

	// Prevent the score from dropping below 0
	if score < 0 {
		score = 0
	}

	// Round to two decimal places for a cleaner database entry
	return math.Round(score*100) / 100
}