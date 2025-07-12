
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, Zap, Battery, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  stationType: 'charging' | 'swap';
  duration: number;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  totalCost: string;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const result = await response.json();
      setBookings(result.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please make sure the backend is running.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalRevenue = () => {
    return bookings.reduce((total, booking) => {
      const cost = parseFloat(booking.totalCost.replace(/[^0-9.]/g, ''));
      return total + cost;
    }, 0).toFixed(2);
  };

  const getBookingsByType = (type: 'charging' | 'swap') => {
    return bookings.filter(booking => booking.stationType === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500"></div>
      </div>
    );
  }

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
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Operator Dashboard</h1>
              <p className="text-gray-600">Manage bookings and monitor station usage</p>
            </div>
          </div>
          <Button
            onClick={fetchBookings}
            variant="outline"
            size="sm"
            className="hover:bg-electric-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-electric-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-electric-500" />
                <div>
                  <p className="text-sm text-gray-600">Charging Sessions</p>
                  <p className="text-2xl font-bold text-gray-800">{getBookingsByType('charging')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-charge-500" />
                <div>
                  <p className="text-sm text-gray-600">Swap Sessions</p>
                  <p className="text-2xl font-bold text-gray-800">{getBookingsByType('swap')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹{getTotalRevenue()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-electric-500" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-4">Start by booking a charging station</p>
                <Button onClick={() => navigate('/stations')}>
                  Find Stations
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {booking.stationType === 'charging' ? (
                        <Zap className="h-5 w-5 text-electric-500" />
                      ) : (
                        <Battery className="h-5 w-5 text-charge-500" />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">{booking.stationName}</h4>
                        <p className="text-sm text-gray-600">
                          {booking.customerName} • {booking.duration} min • {booking.timeSlot}
                        </p>
                        <p className="text-xs text-gray-500">
                          Booked on {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-800">
                        {booking.status}
                      </Badge>
                      <span className="font-semibold text-electric-600">
                        {booking.totalCost}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/booking-status/${booking.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
