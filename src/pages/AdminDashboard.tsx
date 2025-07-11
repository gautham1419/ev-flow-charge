
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Battery, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter,
  ArrowLeft,
  MapPin,
  Clock,
  Mail,
  Phone,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  stationType: 'charging' | 'swap';
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

interface StationStats {
  totalStations: number;
  activeBookings: number;
  totalRevenue: number;
  utilizationRate: number;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<StationStats>({
    totalStations: 0,
    activeBookings: 0,
    totalRevenue: 0,
    utilizationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      // Simulate API calls
      setTimeout(() => {
        const mockBookings: Booking[] = [
          {
            id: '1',
            stationId: '1',
            stationName: 'Tesla Supercharger Downtown',
            stationType: 'charging',
            customerName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            date: '2024-01-15',
            time: '14:00',
            duration: 60,
            status: 'confirmed',
            createdAt: '2024-01-10T10:30:00Z'
          },
          {
            id: '2',
            stationId: '2',
            stationName: 'SwapStation Mall Plaza',
            stationType: 'swap',
            customerName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            date: '2024-01-15',
            time: '16:30',
            duration: 15,
            status: 'completed',
            createdAt: '2024-01-12T09:15:00Z'
          },
          {
            id: '3',
            stationId: '3',
            stationName: 'ChargePlus Highway',
            stationType: 'charging',
            customerName: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            phone: '+1 (555) 456-7890',
            date: '2024-01-16',
            time: '10:00',
            duration: 90,
            status: 'pending',
            createdAt: '2024-01-14T14:20:00Z'
          },
          {
            id: '4',
            stationId: '4',
            stationName: 'EcoCharge Station',
            stationType: 'charging',
            customerName: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+1 (555) 234-5678',
            date: '2024-01-16',
            time: '18:00',
            duration: 120,
            status: 'confirmed',
            createdAt: '2024-01-13T16:45:00Z'
          },
          {
            id: '5',
            stationId: '5',
            stationName: 'QuickSwap Express',
            stationType: 'swap',
            customerName: 'David Brown',
            email: 'david.brown@example.com',
            phone: '+1 (555) 345-6789',
            date: '2024-01-17',
            time: '12:00',
            duration: 15,
            status: 'cancelled',
            createdAt: '2024-01-15T11:30:00Z'
          }
        ];

        const mockStats: StationStats = {
          totalStations: 6,
          activeBookings: mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
          totalRevenue: 2847.50,
          utilizationRate: 78
        };

        setBookings(mockBookings);
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.stationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.stationType === typeFilter);
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-charge-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const StatCard = ({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend?: string }) => (
    <Card className="hover-lift bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              {trend && (
                <span className="text-sm text-charge-600 font-medium">
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className="text-electric-500">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-electric-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Operator Dashboard</h1>
              <p className="text-gray-600">Manage your charging network</p>
            </div>
          </div>
          <Button
            onClick={fetchData}
            disabled={loading}
            className="bg-electric-500 hover:bg-electric-600 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Stations"
            value={stats.totalStations}
            icon={<MapPin className="h-6 w-6" />}
            trend="+2 this month"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<Calendar className="h-6 w-6" />}
            trend="+15% vs last week"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="+8.2% vs last month"
          />
          <StatCard
            title="Utilization Rate"
            value={`${stats.utilizationRate}%`}
            icon={<Battery className="h-6 w-6" />}
            trend="+3.5% vs last week"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="charging">Charging</SelectItem>
                      <SelectItem value="swap">Swapping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {booking.stationType === 'charging' ? (
                                  <Zap className="h-4 w-4 text-electric-500" />
                                ) : (
                                  <Battery className="h-4 w-4 text-charge-500" />
                                )}
                                <h3 className="font-semibold">{booking.stationName}</h3>
                              </div>
                              <Badge className={`${getStatusColor(booking.status)} text-white`}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {booking.customerName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.date)} at {formatTime(booking.time)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.duration < 60 
                                  ? `${booking.duration} min`
                                  : `${booking.duration / 60}h`
                                }
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-3 w-3 mr-1" />
                              Contact
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredBookings.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No bookings found matching your criteria</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stations">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Station Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Station Management</h3>
                  <p className="text-gray-500 mb-4">
                    Detailed station monitoring and management features coming soon
                  </p>
                  <Button className="bg-electric-500 hover:bg-electric-600 text-white">
                    Add New Station
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-500 mb-4">
                    Comprehensive analytics dashboard with charts and insights coming soon
                  </p>
                  <Button className="bg-electric-500 hover:bg-electric-600 text-white">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
