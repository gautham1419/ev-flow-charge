
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, MapPin, Clock, User, Mail, Phone, Calendar, Zap, Battery } from "lucide-react";

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
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

const BookingStatus = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock booking data based on ID
        const mockBooking: Booking = {
          id: bookingId || '1',
          stationId: '1',
          stationName: 'Tesla Supercharger Downtown',
          stationType: 'charging',
          customerName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 60,
          notes: 'First time user, may need assistance',
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };
        
        setBooking(mockBooking);
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="animate-pulse-slow">
          <CheckCircle className="h-8 w-8 text-charge-500" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The requested booking could not be found.</p>
            <Button onClick={() => navigate('/stations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Booking Confirmation</h1>
            <p className="text-gray-600">Your time slot has been reserved</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-8">
              <div className="animate-fade-in">
                <CheckCircle className="h-16 w-16 text-charge-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-4">
                  Your charging session has been successfully reserved.
                </p>
                <Badge className="bg-charge-500 text-white px-4 py-2">
                  Booking ID: #{booking.id}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-electric-500" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Station Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {booking.stationType === 'charging' ? (
                    <Zap className="h-4 w-4 text-electric-500" />
                  ) : (
                    <Battery className="h-4 w-4 text-charge-500" />
                  )}
                  Station Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Station:</span>
                    <span className="font-medium">{booking.stationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{booking.stationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-charge-500 text-white">
                      {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Schedule Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-electric-500" />
                  Schedule
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatTime(booking.time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {booking.duration < 60 
                        ? `${booking.duration} minutes`
                        : `${booking.duration / 60} hour${booking.duration > 60 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-electric-500" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.email}</span>
                  </div>
                  {booking.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{booking.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {booking.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Additional Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Important Information */}
              <div className="bg-electric-50 border border-electric-200 rounded-lg p-4">
                <h4 className="font-semibold text-electric-800 mb-2">Important Information</h4>
                <ul className="text-sm text-electric-700 space-y-1">
                  <li>• Please arrive 5 minutes before your scheduled time</li>
                  <li>• Bring your charging cable if required</li>
                  <li>• Contact support if you need to modify your booking</li>
                  <li>• A confirmation email has been sent to {booking.email}</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  className="flex-1 bg-electric-500 hover:bg-electric-600 text-white"
                  onClick={() => navigate('/stations')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Find More Stations
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-electric-500 text-electric-600 hover:bg-electric-50"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;
