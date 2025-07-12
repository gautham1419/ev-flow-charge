import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Battery, CalendarIcon, Clock, Filter, MapPin, Search, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LocationDialog } from '@/components/LocationDialog';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getDistance } from 'geolib';
import { PredictionModal } from "@/components/PredictionModal";

import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

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
  is_swapping_station: number; // 0 or 1
}

const getAvailabilityColor = (available_slots: number, total_slots: number) => {
  if (total_slots === 0) return 'bg-gray-500'; // Handle division by zero
  const availability = (available_slots / total_slots) * 100;
  if (availability >= 70) return 'bg-charge-500';
  if (availability >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getAvailabilityText = (availability: number) => {
  if (availability >= 70) return 'Available';
  if (availability >= 40) return 'Limited';
  return 'Busy';
};

const getOperationalStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'operational':
      return 'bg-green-500';
    case 'under maintenance':
      return 'bg-yellow-500';
    case 'closed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const MapView = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'charging' | 'swap'>('all');
  const [plugFilter, setPlugFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isLocationDialogOpen, setLocationDialogOpen] = useState(false);
  const mapRef = useRef<L.Map>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [globalDate, setGlobalDate] = useState<Date | undefined>(new Date());
  const [globalTime, setGlobalTime] = useState<string>('10:00');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

  const plugTypes = ['all', ...Array.from(new Set(stations.map(s => s.plug_type_supported)))];

  const handleSetLocation = (lat: number, lon: number) => {
    setUserLocation({ lat, lon });
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 13);
      toast({ title: "Location Set", description: `Map centered and filtering stations within 25km.` });
    }
  };

  const handlePredictionSuccess = (stationId: string, percentage: number) => {
    setPredictions(prev => ({ ...prev, [stationId]: percentage }));
  };

  const getPredictionColor = (percentage: number) => {
    if (percentage < 40) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const mockApiCall = (stationId: string) => {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * 101));
      }, 500 + Math.random() * 1000);
    });
  };

  useEffect(() => {
    const fetchPredictions = async () => {
      if (filteredStations.length === 0) {
        setPredictions({});
        return;
      }

      setIsLoadingPredictions(true);
      const promises = filteredStations.map(station => 
        mockApiCall(station.station_id).then(percentage => ({ stationId: station.station_id, percentage }))
      );
      
      const results = await Promise.all(promises);
      const newPredictions = results.reduce((acc, result) => {
        acc[result.stationId] = result.percentage;
        return acc;
      }, {} as Record<string, number>);

      setPredictions(newPredictions);
      setIsLoadingPredictions(false);
    };

    fetchPredictions();
  }, [filteredStations, globalDate, globalTime]);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [stations, searchTerm, filterType, plugFilter, userLocation]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/kerala_ev_stations_extended.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Station[] = await response.json();
      setStations(data);
    } catch (error) {
      console.error("Failed to fetch stations:", error);
      toast({
        title: "Error Loading Stations",
        description: "Could not fetch station data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStations = () => {
    let filtered = stations;
    
    if (userLocation) {
      filtered = filtered.filter(station => {
        const distance = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lon },
          { latitude: station.latitude, longitude: station.longitude }
        );
        return distance <= 25000; // 25km radius
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      const isSwapping = filterType === 'swap';
      filtered = filtered.filter(station => (station.is_swapping_station === 1) === isSwapping);
    }

    if (plugFilter !== 'all') {
      filtered = filtered.filter(station => station.plug_type_supported === plugFilter);
    }

    setFilteredStations(filtered);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-wrap gap-4">
        <h1 className="text-2xl font-bold">EV Stations</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="search"
            placeholder="Search stations..."
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <LocationDialog onLocationSet={handleSetLocation}>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Set Location
            </Button>
          </LocationDialog>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="w-full sm:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {globalDate ? format(globalDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <DayPicker
                mode="single"
                selected={globalDate}
                onSelect={setGlobalDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={globalTime} onValueChange={setGlobalTime}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
                {[...Array(24).keys()].map(hour => (
                  <SelectItem key={hour} value={`${String(hour).padStart(2, '0')}:00`}>
                    {`${String(hour).padStart(2, '0')}:00`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={[10.8505, 76.2711]} // Centered on Kerala
            zoom={7}
            scrollWheelZoom={false}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredStations.map(station => (
              <Marker key={station.station_id} position={[station.latitude, station.longitude]}>
                <Popup>
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg mb-1">{station.station_name}</h3>
                        <Badge className={`${getOperationalStatusColor(station.operational_status)} text-white text-xs`}>
                            {station.operational_status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground -mt-2">{station.address}</p>
                    <div className="text-sm">
                        <span className="font-semibold">Slots:</span> {station.available_slots} / {station.total_slots} available
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Price:</span> ₹{station.price_per_kwh}/kWh
                    </div>
                    <PredictionModal
                      station={station}
                      date={globalDate}
                      time={globalTime}
                      prediction={predictions[station.station_id] || null}
                    >
                      <Button variant="outline" className="w-full mt-2">View Congestion</Button>
                    </PredictionModal>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <aside className="w-1/3 max-w-sm p-4 border-l overflow-y-auto">
          <div className="space-y-4">
            <div>
              <Label>Filter by Type</Label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'charging' | 'swap')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="charging">Charging Only</SelectItem>
                  <SelectItem value="swap">Swap Stations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter by Plug Type</Label>
              <Select value={plugFilter} onValueChange={setPlugFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by plug type" />
                </SelectTrigger>
                <SelectContent>
                  {plugTypes.map(plug => (
                    <SelectItem key={plug} value={plug}>{plug === 'all' ? 'All Plugs' : plug}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {loading ? (
            <div className="text-center py-8">Loading stations...</div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-8">No stations found for the selected location.</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingPredictions && <p className="text-center text-muted-foreground">Loading predictions...</p>}
              {!isLoadingPredictions && filteredStations.map(station => (
                <PredictionModal
                  key={station.station_id}
                  station={station}
                  date={globalDate}
                  time={globalTime}
                  prediction={predictions[station.station_id] || null}
                >
                  <Card className="mb-4 cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-base">{station.station_name}</span>
                        {predictions[station.station_id] !== undefined && (
                          <Badge className={`${getPredictionColor(predictions[station.station_id])} text-white`}>
                            {`${predictions[station.station_id]}%`}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{station.address}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={`${getOperationalStatusColor(station.operational_status)} text-white`}>{station.operational_status}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Availability</span>
                        <span className="font-medium">{station.available_slots} / {station.total_slots} slots</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="font-medium">{station.owner}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold">₹{station.price_per_kwh}/kWh</span>
                      </div>
                    </CardContent>
                  </Card>
                </PredictionModal>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MapView;
