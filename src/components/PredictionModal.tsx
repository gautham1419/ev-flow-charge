import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Station } from "@/pages/MapView";
import { format } from 'date-fns';

interface PredictionModalProps {
  children: React.ReactNode;
  station: Station;
  date?: Date;
  time?: string;
  prediction: number | null;
}

export const PredictionModal = ({ children, station, date, time, prediction }: PredictionModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Congestion Prediction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <DialogDescription className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="font-medium text-muted-foreground">Station:</div>
            <div>{station.station_name}</div>
            <div className="font-medium text-muted-foreground">Station ID:</div>
            <div>{station.station_id}</div>
            <div className="font-medium text-muted-foreground">Date:</div>
            <div>{date ? format(date, "PPP") : 'Not set'}</div>
            <div className="font-medium text-muted-foreground">Time:</div>
            <div>{time || 'Not set'}</div>
          </DialogDescription>

          {prediction !== null ? (
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Predicted Congestion</p>
              <div
                className={`text-6xl font-bold mt-2 ${
                  prediction < 40 ? 'text-green-500' : prediction < 70 ? 'text-yellow-500' : 'text-red-500'
                }`}
              >
                {prediction}%
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Prediction not available.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
