
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Zap, Battery, MapPin, Clock, User, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Station {
  id: string;
  name: string;
  type: 'charging' | 'swap';
  plugType: string;
  availability: number;
  location: string;
  price: string;
}

const BookingForm = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    duration: '30',
    notes: ''
  });

  useEffect(() => {
    fetchStation();
  }, [stationId]);

  const fetchStation = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const mockStations = [
          {
            id: '1',
            name: 'Tesla Supercharger Downtown',
            type: 'charging' as const,
            plugType: 'CCS2',
            availability: 85,
            location: 'Downtown District',
            price: '$0.28/kWh'
          },
          {
            id: '2',
            name: 'SwapStation Mall Plaza',
            type: 'swap' as const,
            plugType: 'Universal',
            availability: 65,
            location: 'Mall Plaza',
            price: '$15/swap'
          },
          {
            id: '3',
            name: 'ChargePlus Highway',
            type: 'charging' as const,
            plugType: 'CHAdeMO',
            availability: 92,
            location: 'Highway Exit 12',
            price: '$0.32/kWh'
          },
          {
            id: '4',
            name: 'EcoCharge Station',
            type: 'charging' as const,
            plugType: 'Type 2',
            availability: 45,
            location: 'Green Park',
            price: '$0.25/kWh'
          },
          {
            id: '5',
            name: 'QuickSwap Express',
            type: 'swap' as const,
            plugType: 'Universal',
            availability: 78,
            location: 'Business District',
            price: '$18/swap'
          },
          {
            id: '6',
            name: 'PowerHub Central',
            type: 'charging' as const,
            plugType: 'CCS1',
            availability: 100,
            location: 'City Center',
            price: '$0.30/kWh'
          }
        ];
        
        const foundStation = mockStations.find(s => s.id === stationId);
        setStation(foundStation || null);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load station details. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call
      const bookingData = {
        id: Date.now().toString(),
        stationId: station?.id,
        stationName: station?.name,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      console.log('Booking submitted:', bookingData);
      
      setTimeout(() => {
        toast({
          title: "Booking Confirmed!",
          description: "Your time slot has been reserved successfully.",
          variant: "default"
        });
        navigate(`/booking-status/${bookingData.id}`);
      }, 1000);

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to process your booking. Please try again.",
        variant: "destructive"
      });
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const durationOptions = station?.type === 'swap' 
    ? [{ value: '15', label: '15 minutes' }]
    : [
        { value: '30', label: '30 minutes' },
        { value: '60', label: '1 hour' },
        { value: '90', label: '1.5 hours' },
        { value: '120', label: '2 hours' }
      ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <div className="animate-pulse-slow">
          <Zap className="h-8 w-8 text-electric-500" />
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Station Not Found</h2>
            <p className="text-gray-600 mb-4">The requested charging station could not be found.</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Book Time Slot</h1>
            <p className="text-gray-600">Reserve your charging time in advance</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Station Details */}
          <Card className="h-fit bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                {station.type === 'charging' ? (
                  <Zap className="h-6 w-6 text-electric-500" />
                ) : (
                  <Battery className="h-6 w-6 text-charge-500" />
                )}
                <div className="flex-1">
                  <CardTitle className="text-xl">{station.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{station.location}</span>
                  </div>
                </div>
                <Badge className="bg-charge-500 text-white">
                  {station.availability}% Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Type</Label>
                  <p className="font-medium capitalize">{station.type}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Plug Type</Label>
                  <p className="font-medium">{station.plugType}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Price</Label>
                  <p className="font-medium text-electric-600">{station.price}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <p className="font-medium text-charge-600">Available Now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-electric-500" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => handleInputChange('time', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => handleInputChange('duration', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-electric-500 hover:bg-electric-600 text-white py-3"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Booking...
                    </div>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
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
