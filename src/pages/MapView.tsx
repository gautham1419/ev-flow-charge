
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";  
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { MapPin, Zap, Battery, Clock, Search, Filter, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Station {
  id: string;
  name: string;
  type: 'charging' | 'swap';
  plugType: string;
  availability: number;
  location: string;
  price: string;
  distance: string;
  coordinates: { lat: number; lng: number };
  city: string;
}

// Fallback mock data for when backend is not available
const mockStations: Station[] = [
  {
    id: "1",
    name: "Tesla Supercharger Connaught Place",
    type: "charging",
    plugType: "CCS2",
    availability: 85,
    location: "Connaught Place, New Delhi",
    price: "₹12/kWh",
    distance: "2.3 km",
    coordinates: { lat: 28.6328, lng: 77.2197 },
    city: "New Delhi"
  },
  {
    id: "2",
    name: "SwapStation Select City Walk",
    type: "swap",
    plugType: "Universal",
    availability: 65,
    location: "Select City Walk, Saket",
    price: "₹800/swap",
    distance: "8.5 km",
    coordinates: { lat: 28.5245, lng: 77.2066 },
    city: "New Delhi"
  },
  {
    id: "3",
    name: "ChargePlus DLF Mall",
    type: "charging",
    plugType: "CHAdeMO",
    availability: 92,
    location: "DLF Mall, Noida",
    price: "₹15/kWh",
    distance: "12.1 km",
    coordinates: { lat: 28.5355, lng: 77.3910 },
    city: "Noida"
  },
  {
    id: "4",
    name: "EcoCharge Cyber Hub",
    type: "charging",
    plugType: "Type 2",
    availability: 45,
    location: "Cyber Hub, Gurgaon",
    price: "₹10/kWh",
    distance: "18.7 km",
    coordinates: { lat: 28.4595, lng: 77.0266 },
    city: "Gurgaon"
  },
  {
    id: "5",
    name: "QuickSwap Metro Station",
    type: "swap",
    plugType: "Universal",
    availability: 78,
    location: "Rajiv Chowk Metro, New Delhi",
    price: "₹750/swap",
    distance: "3.8 km",
    coordinates: { lat: 28.6333, lng: 77.2194 },
    city: "New Delhi"
  },
  {
    id: "6",
    name: "PowerHub Karol Bagh",
    type: "charging",
    plugType: "CCS1",
    availability: 100,
    location: "Karol Bagh Market, New Delhi",
    price: "₹14/kWh",
    distance: "5.2 km",
    coordinates: { lat: 28.6519, lng: 77.1909 },
    city: "New Delhi"
  }
];

const MapView = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'charging' | 'swap'>('all');
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [stations, searchTerm, filterType]);

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stations');
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const result = await response.json();
      setStations(result.data);
      setUsingMockData(false);
      setLoading(false);
    } catch (error) {
      console.log('Backend not available, using mock data');
      setStations(mockStations);
      setUsingMockData(true);
      setLoading(false);
      toast({
        title: "Using Demo Data",
        description: "Backend is not running. Showing demo stations data.",
        variant: "default"
      });
    }
  };

  const filterStations = () => {
    let filtered = stations;

    if (filterType !== 'all') {
      filtered = filtered.filter(station => station.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStations(filtered);
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 70) return 'bg-green-500';
    if (availability >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAvailabilityText = (availability: number) => {
    if (availability >= 70) return 'Available';
    if (availability >= 40) return 'Limited';
    return 'Busy';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Charging Stations in Delhi NCR</h1>
              <p className="text-gray-600">
                Find the perfect station for your needs
                {usingMockData && (
                  <span className="ml-2 text-sm text-orange-600">(Demo Mode)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stations, locations, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              All Stations
            </Button>
            <Button
              variant={filterType === 'charging' ? 'default' : 'outline'}
              onClick={() => setFilterType('charging')}
              className="whitespace-nowrap"
            >
              <Zap className="h-4 w-4 mr-2" />
              Charging
            </Button>
            <Button
              variant={filterType === 'swap' ? 'default' : 'outline'}
              onClick={() => setFilterType('swap')}
              className="whitespace-nowrap"
            >
              <Battery className="h-4 w-4 mr-2" />
              Swapping
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stations Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station, index) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow bg-white border shadow-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {station.type === 'charging' ? (
                        <Zap className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Battery className="h-5 w-5 text-green-500" />
                      )}
                      <CardTitle className="text-lg">{station.name}</CardTitle>
                    </div>
                    <Badge
                      className={`${getAvailabilityColor(station.availability)} text-white`}
                    >
                      {getAvailabilityText(station.availability)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{station.location}</span>
                    <span className="ml-auto font-medium">{station.distance}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{station.city}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plug Type:</span>
                    <span className="font-medium">{station.plugType}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-blue-600">{station.price}</span>
                  </div>

                  {/* Availability Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Availability</span>
                      <span className="font-medium">{station.availability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getAvailabilityColor(station.availability)}`}
                        style={{ width: `${station.availability}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate(`/book/${station.id}`)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Book Time Slot
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredStations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No stations found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
