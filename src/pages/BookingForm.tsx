
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Battery, MapPin, Clock, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Station } from './MapView'; // Import the unified Station interface

interface FormData {
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
}

const BookingForm = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: '60',
    notes: '',
  });

  useEffect(() => {
    if (stationId) {
      fetchStation(stationId);
    }
  }, [stationId]);

  const fetchStation = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch('/kerala_ev_stations_extended.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stations: Station[] = await response.json();
      const foundStation = stations.find(s => s.station_id === id);
      setStation(foundStation || null);
    } catch (error) {
      console.error("Failed to fetch station details:", error);
      toast({
        title: "Error",
        description: "Failed to load station details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;

    setSubmitting(true);
    try {
      const bookingData = {
        id: Date.now().toString(),
        stationId: station.station_id,
        stationName: station.station_name,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        status: 'Confirmed'
      };

      console.log('Booking Submitted:', bookingData);
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([...existingBookings, bookingData]));

      setTimeout(() => {
        toast({
          title: "Booking Confirmed!",
          description: `Your slot at ${station.station_name} is booked.`,
        });
        setSubmitting(false);
        navigate('/bookings');
      }, 1500);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading station details...</div>;
  }

  if (!station) {
    return <div className="flex justify-center items-center h-screen">Station not found.</div>;
  }

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0) ? '00' : '30';
    return `${hours}:${minutes}`;
  });

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  const getAvailabilityColor = (available: number, total: number) => {
    if (total === 0) return 'bg-gray-500';
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Map
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Station Details Column */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{station.station_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getAvailabilityColor(station.available_slots, station.total_slots)}>
                    {station.available_slots} / {station.total_slots} available
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{station.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {station.is_swapping_station ? <Battery className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  <span>{station.plug_type_supported}</span>
                </div>
                <div className="text-lg font-bold">
                  ₹{station.price_per_kwh}/kWh
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form Column */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          type="text"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 12345 67890"
                        required
                      />
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
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time *</Label>
                        <Select
                          name="time"
                          value={formData.time}
                          onValueChange={(value) => handleSelectChange('time', value)}
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
                        name="duration"
                        value={formData.duration}
                        onValueChange={(value) => handleSelectChange('duration', value)}
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
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
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
    </div>
  );
};

export default BookingForm;

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
>>>>>>> a7647a36637b0364cc852aa9cc83e852895728b5
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
