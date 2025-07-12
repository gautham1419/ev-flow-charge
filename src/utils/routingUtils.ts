import { getDistance, getCenter } from 'geolib';
import * as turf from '@turf/turf';

export interface Station {
  station_id: string;
  station_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  address: string;
  charger_type: string;
  power_rating_kw: number;
  plug_type_supported: string;
  total_slots: number;
  available_slots: number;
  price_per_kwh: number;
  operational_status: string;
  last_updated: string;
  peak_hours: string;
  average_session_time: number;
  current_load_percentage: number;
  daily_sessions: number;
  revenue_today: number;
  owner: string;
  is_swapping_station: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  type: 'start' | 'destination' | 'charging_stop';
  station?: Station;
  batteryLevel?: number;
  distanceFromStart?: number;
}

export interface RoutingFormData {
  startLat: number;
  startLng: number;
  destinationLat: number;
  destinationLng: number;
  batteryPercent: number;
  fullRangeKm: number;
}

/**
 * Calculate usable battery range based on current battery percentage and full range
 */
export function getUsableRange(batteryPercent: number, fullRangeKm: number): number {
  return (batteryPercent / 100) * fullRangeKm;
}

/**
 * Find charging stations within a specified distance from any point on the route
 */
export function findStationsAlongRoute(
  routePoints: [number, number][], // [lat, lng]
  stations: Station[],
  maxDistanceKm: number = 10 // Reduced from 25 to 10 for accuracy
): Station[] {
  const nearbyStations: Station[] = [];
  const maxDistanceMeters = maxDistanceKm * 1000;

  // Convert routePoints to [lng, lat] for Turf
  const turfRoutePoints = routePoints.map(([lat, lng]) => [lng, lat]);
  const routeLine = turf.lineString(turfRoutePoints);

  console.log('Checking', stations.length, 'stations for proximity to route.');
  stations.forEach(station => {
    const stationPoint = turf.point([station.longitude, station.latitude]);
    // Use pointToLineDistance for accurate proximity
    const distance = turf.pointToLineDistance(stationPoint, routeLine, { units: 'meters' });
    if (distance <= maxDistanceMeters) {
      nearbyStations.push(station);
    }
    console.log(`Station ${station.station_name} at [${station.latitude},${station.longitude}] is ${distance.toFixed(2)}m from route.`);
  });

  console.log('Nearby stations found:', nearbyStations.length);
  return nearbyStations;
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return getDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 }
  ) / 1000; // Convert to kilometers
}

/**
 * Find the nearest charging station to a given point
 */
export function findNearestStation(
  lat: number,
  lng: number,
  stations: Station[]
): Station | null {
  if (stations.length === 0) return null;

  let nearestStation = stations[0];
  let minDistance = calculateDistance(lat, lng, nearestStation.latitude, nearestStation.longitude);

  stations.forEach(station => {
    const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  });

  return nearestStation;
}

/**
 * Simulate driving along the route and insert charging stops when needed
 */
export function calculateChargingStops(
  routePoints: [number, number][],
  stations: Station[],
  initialBatteryPercent: number,
  fullRangeKm: number,
  minBatteryThreshold: number = 30
): RoutePoint[] {
  const routeWithStops: RoutePoint[] = [];
  let currentBattery = initialBatteryPercent;
  let totalDistance = 0;
  let currentLat = routePoints[0][0];
  let currentLng = routePoints[0][1];
  let destLat = routePoints[routePoints.length - 1][0];
  let destLng = routePoints[routePoints.length - 1][1];
  let remainingStations = [...stations];

  // Add start point
  routeWithStops.push({
    lat: currentLat,
    lng: currentLng,
    type: 'start',
    batteryLevel: currentBattery,
    distanceFromStart: 0
  });

  while (true) {
    const distanceToDest = calculateDistance(currentLat, currentLng, destLat, destLng);
    const usableRange = getUsableRange(currentBattery, fullRangeKm);
    if (usableRange >= distanceToDest) {
      // Can reach destination
      totalDistance += distanceToDest;
      currentBattery = Math.max(0, currentBattery - (distanceToDest / fullRangeKm) * 100);
      routeWithStops.push({
        lat: destLat,
        lng: destLng,
        type: 'destination',
        batteryLevel: currentBattery,
        distanceFromStart: totalDistance
      });
      break;
    }
    // Need to find a reachable charging station
    // Only consider stations within usable range
    const reachableStations = remainingStations
      .map(station => ({
        station,
        dist: calculateDistance(currentLat, currentLng, station.latitude, station.longitude)
      }))
      .filter(({ dist }) => dist <= usableRange)
      .sort((a, b) => a.dist - b.dist);
    if (reachableStations.length === 0) {
      // No reachable stations, cannot proceed
      break;
    }
    // Pick the closest reachable station that brings us closer to the destination
    let nextStop = reachableStations[0];
    for (const s of reachableStations) {
      const distToDest = calculateDistance(s.station.latitude, s.station.longitude, destLat, destLng);
      if (distToDest < distanceToDest) {
        nextStop = s;
        break;
      }
    }
    // Add charging stop
    totalDistance += nextStop.dist;
    routeWithStops.push({
      lat: nextStop.station.latitude,
      lng: nextStop.station.longitude,
      type: 'charging_stop',
      station: nextStop.station,
      batteryLevel: currentBattery,
      distanceFromStart: totalDistance - nextStop.dist
    });
    // Reset battery
    currentBattery = 100;
    // Move to charging stop
    currentLat = nextStop.station.latitude;
    currentLng = nextStop.station.longitude;
    // Remove this station from future consideration
    remainingStations = remainingStations.filter(s => s.station_id !== nextStop.station.station_id);
  }
  return routeWithStops;
}

/**
 * Calculate total route distance in kilometers (sum of polyline segments)
 */
export function calculateTotalRouteDistance(routePoints: [number, number][]): number {
  let totalDistance = 0;
  for (let i = 1; i < routePoints.length; i++) {
    const prevPoint = routePoints[i - 1];
    const currentPoint = routePoints[i];
    totalDistance += getDistance(
      { latitude: prevPoint[0], longitude: prevPoint[1] },
      { latitude: currentPoint[0], longitude: currentPoint[1] }
    ) / 1000; // meters to km
  }
  return totalDistance;
}

/**
 * Validate routing form data
 */
export function validateRoutingData(data: RoutingFormData): string | null {
  if (data.batteryPercent < 0 || data.batteryPercent > 100) {
    return 'Battery percentage must be between 0 and 100';
  }
  
  if (data.fullRangeKm <= 0) {
    return 'Full range must be greater than 0';
  }
  
  if (data.startLat === data.destinationLat && data.startLng === data.destinationLng) {
    return 'Start and destination cannot be the same';
  }
  
  return null;
} 

/**
 * Fetch the real road route polyline from the OSRM demo server
 * @param start [lat, lng]
 * @param end [lat, lng]
 * @returns Promise<[number, number][]> (array of [lat, lng] points)
 */
export async function fetchOsrmRoutePolyline(start: [number, number], end: [number, number]): Promise<[number, number][]> {
  // OSRM expects [lng,lat] order
  const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch route from OSRM');
  const data = await res.json();
  if (!data.routes || !data.routes[0] || !data.routes[0].geometry) throw new Error('No route found');
  // Convert [lng,lat] to [lat,lng]
  return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
} 