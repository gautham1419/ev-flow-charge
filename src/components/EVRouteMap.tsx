import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { RoutePoint, Station } from '@/utils/routingUtils';

// Extend Leaflet types for routing machine
declare module 'leaflet' {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints?: L.LatLng[];
      routeWhileDragging?: boolean;
      showAlternatives?: boolean;
      fitSelectedRoutes?: boolean;
      show?: boolean;
      lineOptions?: L.PathOptions;
      createMarker?: (waypointIndex: number, waypoint: any, numberOfWaypoints: number) => L.Marker;
    }
    
    class RoutingControl extends L.Control {
      constructor(options?: RoutingControlOptions);
      getWaypoints(): L.LatLng[];
      setWaypoints(waypoints: L.LatLng[]): void;
      on(event: string, handler: (e: any) => void): void;
    }
  }
  
  namespace routing {
    function routingControl(options?: Routing.RoutingControlOptions): Routing.RoutingControl;
  }
}

interface EVRouteMapProps {
  startPoint: [number, number];
  endPoint: [number, number];
  chargingStops: RoutePoint[];
  stations: Station[];
  onRouteCalculated?: (routePoints: [number, number][], realDistanceKm: number) => void;
}

// Custom charging stop icon
const createChargingStopIcon = () => {
  return L.divIcon({
    className: 'custom-charging-stop-icon',
    html: `
      <div style="
        background: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        ⚡
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Custom start/end icons
const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-start-icon',
    html: `
      <div style="
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        S
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const createEndIcon = () => {
  return L.divIcon({
    className: 'custom-end-icon',
    html: `
      <div style="
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        E
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const EVRouteMap: React.FC<EVRouteMapProps> = ({
  startPoint,
  endPoint,
  chargingStops,
  stations,
  onRouteCalculated
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.RoutingControl | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    let isMounted = true;
    import('leaflet-routing-machine').then(() => {
      if (!isMounted) return;
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];
      // Build waypoints: start, all charging stops, destination
      const waypoints: L.LatLng[] = [];
      waypoints.push(L.latLng(startPoint[0], startPoint[1]));
      chargingStops
        .filter(stop => stop.type === 'charging_stop')
        .forEach(stop => {
          waypoints.push(L.latLng(stop.lat, stop.lng));
        });
      waypoints.push(L.latLng(endPoint[0], endPoint[1]));
      // Create routing control
      const routingControl = L.Routing.routingControl({
        waypoints,
        routeWhileDragging: false,
        showAlternatives: true, // Enable alternate routes
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [
            { color: '#3b82f6', opacity: 0.8, weight: 6 }
          ]
        },
        createMarker: (waypointIndex: number, waypoint: any, numberOfWaypoints: number) => {
          let icon: L.DivIcon;
          let popupContent: string;
          if (waypointIndex === 0) {
            icon = createStartIcon();
            popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-blue-600">Start Point</h3>
                <p class="text-sm">Lat: ${waypoint.latLng.lat.toFixed(6)}</p>
                <p class="text-sm">Lng: ${waypoint.latLng.lng.toFixed(6)}</p>
              </div>
            `;
          } else if (waypointIndex === numberOfWaypoints - 1) {
            icon = createEndIcon();
            popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-red-600">Destination</h3>
                <p class="text-sm">Lat: ${waypoint.latLng.lat.toFixed(6)}</p>
                <p class="text-sm">Lng: ${waypoint.latLng.lng.toFixed(6)}</p>
              </div>
            `;
          } else {
            // Charging stop marker
            const chargingStop = chargingStops.find(stop => 
              stop.type === 'charging_stop' && 
              Math.abs(stop.lat - waypoint.latLng.lat) < 0.001 &&
              Math.abs(stop.lng - waypoint.latLng.lng) < 0.001
            );
            icon = createChargingStopIcon();
            popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-green-600">Charging Stop ${waypointIndex}</h3>
                ${chargingStop?.station ? `
                  <p class="text-sm font-semibold">${chargingStop.station.station_name}</p>
                  <p class="text-sm">${chargingStop.station.address}</p>
                  <p class="text-sm">Price: ₹${chargingStop.station.price_per_kwh}/kWh</p>
                  <p class="text-sm">Available: ${chargingStop.station.available_slots}/${chargingStop.station.total_slots}</p>
                  <p class="text-sm">Battery before: ${chargingStop.batteryLevel?.toFixed(1)}%</p>
                  <p class="text-sm">Distance: ${chargingStop.distanceFromStart?.toFixed(1)} km</p>
                ` : ''}
              </div>
            `;
          }
          const marker = L.marker(waypoint.latLng, { icon });
          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
          map.addLayer(marker);
          return marker;
        }
      });
      routingControl.addTo(map);
      routingControlRef.current = routingControl;
      routingControl.on('routesfound', (e: any) => {
        if (e.routes && e.routes.length > 0) {
          const route = e.routes[0];
          const routePoints: [number, number][] = route.coordinates.map((coord: any) => [coord.lat, coord.lng]);
          // Use the real road distance from the route summary
          const realDistanceKm = route.summary.totalDistance / 1000;
          if (onRouteCalculated) {
            onRouteCalculated(routePoints, realDistanceKm);
          }
        }
      });
    });
    return () => {
      isMounted = false;
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
      markersRef.current.forEach(marker => map.removeLayer(marker));
    };
  }, [startPoint, endPoint, chargingStops, map, onRouteCalculated]);

  return null;
};

export default EVRouteMap; 