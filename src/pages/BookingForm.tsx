
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Zap, Battery, MapPin, Clock, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Station {
  id: string;
  name: string;
  type: 'charging' | 'swap';
  plugType: string;
  availability: number;
  location: string;
  price: string;
  city: string;
}

const BookingForm = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    duration: '',
    timeSlot: '',
    customerName: '',
    customerEmail: ''
  });

  useEffect(() => {
    if (stationId) {
      fetchStation(stationId);
    }
  }, [stationId]);

  const fetchStation = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stations/${id}`);
      if (!response.ok) {
        throw new Error('Station not found');
      }
      const result = await response.json();
      setStation(result.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching station:', error);
      toast({
        title: "Error",
        description: "Failed to load station details. Please try again.",
        variant: "destructive"
      });
      navigate('/stations');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.duration || !formData.timeSlot) {
      toast({
        title: "Missing Information",
        description: "Please fill in duration and time slot.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: stationId,
          duration: parseInt(formData.duration),
          timeSlot: formData.timeSlot,
          customerName: formData.customerName || 'Anonymous',
          customerEmail: formData.customerEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      toast({
        title: "Booking Confirmed!",
        description: "Your charging slot has been booked successfully.",
      });

      navigate(`/booking-status/${result.data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let hour = currentHour + 1; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    
    // Add next day slots
    for (let hour = 6; hour < 12; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00 (Next Day)`;
      slots.push(timeString);
    }
    
    return slots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Station Not Found</h2>
          <Button onClick={() => navigate('/stations')}>Back to Stations</Button>
        </div>
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
            Back to Stations
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Book Charging Slot</h1>
            <p className="text-gray-600">Reserve your spot at {station.name}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Station Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {station.type === 'charging' ? (
                  <Zap className="h-5 w-5 text-electric-500" />
                ) : (
                  <Battery className="h-5 w-5 text-charge-500" />
                )}
                {station.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{station.location}, {station.city}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium capitalize">{station.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Plug Type:</span>
                  <p className="font-medium">{station.plugType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <p className="font-medium text-electric-600">{station.price}</p>
                </div>
                <div>
                  <span className="text-gray-600">Availability:</span>
                  <p className="font-medium">{station.availability}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-charge-500" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (minutes) *
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    placeholder="e.g., 60"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 15 minutes, maximum 4 hours
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">
                    Preferred Time Slot *
                  </Label>
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={(e) => handleInputChange(e as any)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a time slot</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    <User className="h-4 w-4 inline mr-1" />
                    Name (Optional)
                  </Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    type="text"
                    placeholder="Your name"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email (Optional)
                  </Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-gray-500">
                    We'll send booking confirmation to this email
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-electric-500 hover:bg-electric-600 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
