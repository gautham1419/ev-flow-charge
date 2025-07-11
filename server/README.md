
# ChargeSmart Backend API

## Setup Instructions

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The API will be available at `http://localhost:5000`

## API Endpoints

### Stations
- `GET /api/stations` - Get all charging stations
- `GET /api/stations/:id` - Get specific station by ID

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get specific booking by ID

### Health Check
- `GET /api/health` - Check if the API is running

## Example API Calls

### Get all stations:
```bash
curl http://localhost:5000/api/stations
```

### Create a booking:
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "1",
    "duration": 60,
    "timeSlot": "2024-01-15T10:00:00Z",
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }'
```

### Get all bookings:
```bash
curl http://localhost:5000/api/bookings
```

## Data Structure

### Station Object:
```json
{
  "id": "1",
  "name": "Tesla Supercharger Downtown",
  "type": "charging",
  "plugType": "CCS2",
  "availability": 85,
  "location": "Downtown District",
  "price": "$0.28/kWh",
  "distance": "0.8 km",
  "coordinates": { "lat": 40.7128, "lng": -74.0060 }
}
```

### Booking Object:
```json
{
  "id": "uuid",
  "stationId": "1",
  "stationName": "Tesla Supercharger Downtown",
  "stationType": "charging",
  "duration": 60,
  "timeSlot": "2024-01-15T10:00:00Z",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "status": "confirmed",
  "createdAt": "2024-01-15T09:30:00Z",
  "totalCost": "$14.00"
}
```
