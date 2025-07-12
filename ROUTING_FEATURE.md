# Smart EV Routing System

## Overview

The Smart EV Routing System is a comprehensive solution for electric vehicle owners to plan their journeys with optimal charging stops. The system calculates routes based on battery capacity, remaining range, and charging station proximity.

## Features Implemented

### 🔁 Routing with Leaflet
- **Leaflet Routing Machine Integration**: Uses `leaflet-routing-machine` with `react-leaflet` to compute and display routes
- **Interactive Route Display**: Shows the complete route between start and destination points
- **Programmatic Control**: Start and end points can be defined through input fields

### 🔋 Battery Range Calculation
- **Usable Range Function**: `getUsableRange(batteryPercent, fullRangeKm)` calculates estimated travelable distance
- **Real-time Battery Simulation**: Tracks battery depletion as the vehicle travels along the route
- **Smart Threshold Management**: Triggers charging stops when battery drops below 30km range

### 📍 Charging Station Detection
- **Proximity Analysis**: Finds all stations within 10km of any route point using `@turf/turf`
- **Distance Calculation**: Accurate distance calculations using `geolib`
- **Station Filtering**: Filters operational stations with available charging slots

### 🛑 Intelligent Charging Stop Insertion
- **Route Simulation**: Simulates driving along the route while tracking battery consumption
- **Automatic Stop Insertion**: Adds charging stops when battery range drops below threshold
- **Battery Reset**: Simulates full charging (100%) at each stop
- **Optimized Route**: Returns modified route with charging detours

### 🗺️ Visual Route Rendering
- **Custom Markers**: Different icons for start points, destinations, and charging stops
- **Color-coded Route**: Blue route line with charging stop indicators
- **Interactive Popups**: Detailed information for each route point
- **Responsive Design**: Works on both desktop and mobile devices

### 🧾 User Input Form
- **Comprehensive Form**: Input fields for start/destination coordinates, battery percentage, and full range
- **Validation**: Form validation for all inputs with helpful error messages
- **Default Values**: Pre-filled with sample coordinates for easy testing
- **Real-time Updates**: Route recalculates automatically when form is submitted

## Technical Implementation

### Dependencies Added
```json
{
  "leaflet-routing-machine": "^3.2.12",
  "@turf/turf": "^6.5.0"
}
```

### Key Components

#### 1. `src/utils/routingUtils.ts`
Core utility functions for routing calculations:
- `getUsableRange()`: Calculate usable battery range
- `findStationsAlongRoute()`: Find nearby charging stations
- `calculateChargingStops()`: Simulate route with charging stops
- `calculateDistance()`: Calculate distance between points
- `validateRoutingData()`: Form validation

#### 2. `src/components/EVRouteMap.tsx`
Custom Leaflet component for route visualization:
- Integrates Leaflet Routing Machine
- Custom markers for different route points
- Interactive popups with station information
- Route calculation callbacks

#### 3. `src/pages/EVRouting.tsx`
Main routing page with form and map:
- User input form for route parameters
- Route calculation and visualization
- Charging stop summary
- Navigation integration

### Route Calculation Algorithm

1. **Input Validation**: Validate user inputs (coordinates, battery, range)
2. **Initial Route**: Create direct route from start to destination
3. **Station Detection**: Find charging stations within 10km of route
4. **Battery Simulation**: Simulate driving while tracking battery consumption
5. **Stop Insertion**: Add charging stops when battery drops below 30km
6. **Route Optimization**: Calculate final route with charging detours
7. **Visualization**: Display route with custom markers and popups

### Battery Simulation Logic

```typescript
// For each route segment:
const segmentDistance = calculateDistance(prevPoint, currentPoint);
const batteryUsed = (segmentDistance / fullRangeKm) * 100;
currentBattery = Math.max(0, currentBattery - batteryUsed);

// When battery is low:
if (usableRange < minBatteryThreshold) {
  const nearestStation = findNearestStation(currentPoint, stations);
  if (nearestStation) {
    // Add charging stop
    currentBattery = 100; // Reset to full charge
  }
}
```

## Usage Instructions

### Accessing the Routing Feature

1. **From Homepage**: Click "Smart Routing" button on the main page
2. **From Map View**: Click "Smart Routing" button in the header
3. **Direct URL**: Navigate to `/routing`

### Setting Up a Route

1. **Enter Start Coordinates**: Latitude and longitude of starting point
2. **Enter Destination**: Latitude and longitude of destination
3. **Set Battery Level**: Current battery percentage (0-100%)
4. **Specify Full Range**: Total range of your EV in kilometers
5. **Calculate Route**: Click "Calculate Route" button

### Understanding the Results

- **Route Line**: Blue line showing the complete route
- **Start Marker**: Blue "S" marker for starting point
- **Charging Stops**: Green "⚡" markers for charging stations
- **End Marker**: Red "E" marker for destination
- **Route Summary**: Shows total distance, charging stops, and battery levels

### Route Summary Information

- **Total Distance**: Complete route distance in kilometers
- **Usable Range**: Current battery range based on percentage
- **Charging Stops**: Number of required charging stops
- **Stop Details**: Station name, address, price, and battery levels

## Sample Data

The system uses mock charging station data from `public/kerala_ev_stations_extended.json` with the following structure:

```json
{
  "station_id": "string",
  "station_name": "string",
  "latitude": "number",
  "longitude": "number",
  "address": "string",
  "price_per_kwh": "number",
  "available_slots": "number",
  "total_slots": "number",
  "operational_status": "string"
}
```

## Future Enhancements

### Real-time Integration
- **Live Station Data**: Connect to real-time charging station APIs
- **Dynamic Availability**: Real-time slot availability updates
- **Traffic Integration**: Consider traffic conditions in route calculation

### Advanced Features
- **Multiple Route Options**: Show alternative routes with different charging strategies
- **Cost Optimization**: Calculate total charging costs for different routes
- **Time Estimation**: Include charging time in total journey time
- **Weather Integration**: Consider weather impact on battery consumption

### User Experience
- **Address Autocomplete**: Use geocoding for address input instead of coordinates
- **Favorite Routes**: Save and reuse frequently traveled routes
- **Route Sharing**: Share routes with other users
- **Offline Support**: Cache routes for offline use

## Technical Notes

### Performance Considerations
- **Route Calculation**: Optimized for routes up to 500km
- **Station Filtering**: Efficient spatial queries using Turf.js
- **Memory Management**: Proper cleanup of Leaflet components

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: Responsive design for mobile devices
- **Offline Capability**: Basic functionality works offline

### Error Handling
- **Network Errors**: Graceful handling of API failures
- **Invalid Inputs**: Comprehensive form validation
- **No Stations Found**: Fallback behavior when no charging stations are available

## Troubleshooting

### Common Issues

1. **Route Not Calculating**
   - Check that coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
   - Ensure battery percentage is between 0-100
   - Verify full range is greater than 0

2. **No Charging Stops Found**
   - Increase the proximity radius (currently 10km)
   - Check if stations are operational and have available slots
   - Verify station data is loaded correctly

3. **Map Not Displaying**
   - Check internet connection for map tiles
   - Ensure Leaflet CSS is loaded
   - Verify browser supports required features

### Debug Information

Enable browser developer tools to see:
- Route calculation logs
- Station filtering results
- Battery simulation steps
- Error messages and warnings

## API Reference

### Utility Functions

```typescript
// Calculate usable battery range
getUsableRange(batteryPercent: number, fullRangeKm: number): number

// Find stations near route
findStationsAlongRoute(routePoints: [number, number][], stations: Station[], maxDistanceKm: number): Station[]

// Calculate route with charging stops
calculateChargingStops(routePoints: [number, number][], stations: Station[], initialBatteryPercent: number, fullRangeKm: number, minBatteryThreshold: number): RoutePoint[]

// Validate routing form data
validateRoutingData(data: RoutingFormData): string | null
```

### Component Props

```typescript
interface EVRouteMapProps {
  startPoint: [number, number];
  endPoint: [number, number];
  chargingStops: RoutePoint[];
  stations: Station[];
  onRouteCalculated?: (routePoints: [number, number][]) => void;
}
```

This routing system provides a solid foundation for EV journey planning and can be easily extended with additional features and real-time data integration. 