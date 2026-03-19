interface CreateTripResponse {
  status: string;
  message: string;
  trip_id: number;
}
export interface TelemetryPayload {
  trip_id: number;
  latitude: number;
  longitude: number;
  altitude_meters: number | null;
  speed_mps: number | null;
}

export async function startNewTrip(): Promise<number | null> {
  try {
    const response = await fetch('http://localhost:8080/api/trips', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data: CreateTripResponse = await response.json();
    console.log("Started new trip with ID:", data.trip_id);
    
    return data.trip_id;

  } catch (error) {
    console.error("Failed to start trip:", error);
    return null;
  }
}

export async function sendTelemetryData(payload: TelemetryPayload): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8080/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Server error: ${response.status} ${response.statusText}`);
    }

    return true;

  } catch (error) {
    console.error("Error: ", error);
    return false;
  }
}

export async function endTrip(tripId: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8080/api/trips/${tripId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    console.log(`Trip ${tripId} successfully ended.`);
    return true;

  } catch (error) {
    console.error("Failed to end trip:", error);
    return false;
  }
}