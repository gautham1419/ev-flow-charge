
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, MapPin, Zap, Battery, ArrowLeft, Calendar, User, Mail } from "lucide-react";
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

const BookingStatus = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`);
      if (!response.ok) {
        throw new Error('Booking not found');
      }
      const result = await response.json();
      setBooking(result.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details. Please try again.",
        variant: "destructive"
      });
      navigate('/stations');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
          <Button onClick={() => navigate('/stations')}>Back to Stations</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/stations')}
            className="hover:bg-electric-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stations
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Booking Confirmation</h1>
            <p className="text-gray-600">Your charging slot has been reserved</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">
              Your booking ID is <span className="font-mono font-semibold">{booking.id}</span>
            </p>
          </div>

          {/* Booking Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {booking.stationType === 'charging' ? (
                  <Zap className="h-5 w-5 text-electric-500" />
                ) : (
                  <Battery className="h-5 w-5 text-charge-500" />
                )}
                {booking.stationName}
                <Badge className="ml-auto bg-green-100 text-green-800">
                  {booking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <div>
                    <p className="text-sm">Duration</p>
                    <p className="font-medium text-gray-800">{booking.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-sm">Time Slot</p>
                    <p className="font-medium text-gray-800">{booking.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="text-sm">Customer</p>
                    <p className="font-medium text-gray-800">{booking.customerName}</p>
                  </div>
                </div>

                {booking.customerEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <div>
                      <p className="text-sm">Email</p>
                      <p className="font-medium text-gray-800">{booking.customerEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-bold text-electric-600">{booking.totalCost}</span>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Booked on: {formatDate(booking.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/stations')}
              className="flex-1 bg-electric-500 hover:bg-electric-600 text-white"
            >
              Book Another Station
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex-1"
            >
              View All Bookings
            </Button>
          </div>

          {/* Important Notes */}
          <Card className="bg-yellow-50 border-yellow-200 mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Please arrive 5 minutes before your scheduled time</li>
                <li>• Bring your charging cable if required</li>
                <li>• Contact support if you need to modify your booking</li>
                <li>• Late arrivals may result in slot cancellation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;
