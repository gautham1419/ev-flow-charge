import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LocationDialogProps {
  children: React.ReactNode;
  onLocationSet: (lat: number, lon: number) => void;
}

export const LocationDialog = ({ children, onLocationSet }: LocationDialogProps) => {
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleManualSearch = async () => {
    if (!cityName) {
      toast({ title: "Error", description: "Please enter a city name.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onLocationSet(parseFloat(lat), parseFloat(lon));
        toast({ title: "Success", description: `Location set to ${data[0].display_name}` });
        setOpen(false);
      } else {
        toast({ title: "Error", description: "Could not find location. Please try another city.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch location data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSet(position.coords.latitude, position.coords.longitude);
          toast({ title: "Success", description: "Using your current location." });
          setOpen(false);
        },
        () => {
          toast({ title: "Error", description: "Could not get your location. Please enable location services.", variant: "destructive" });
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] z-[2000]">
        <DialogHeader>
          <DialogTitle>Set Your Location</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              City Name
            </Label>
            <Input
              id="city"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Delhi"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button onClick={handleCurrentLocation} variant="outline">Use My Current Location</Button>
          <Button onClick={handleManualSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Set Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
