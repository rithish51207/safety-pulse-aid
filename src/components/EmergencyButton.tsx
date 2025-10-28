import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EmergencyButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmergencyClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    // This would trigger emergency protocols
    // For now, we'll just show a success message
    toast.success("Emergency alert sent to your contacts!");
    setShowConfirm(false);
    
    // In a real app, this would:
    // 1. Send location to emergency contacts
    // 2. Call emergency services
    // 3. Share medical information
  };

  return (
    <>
      <Button
        onClick={handleEmergencyClick}
        className="h-48 w-48 rounded-full bg-emergency hover:bg-emergency/90 shadow-2xl shadow-emergency/50 animate-pulse"
        size="lg"
      >
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="h-16 w-16" />
          <span className="text-2xl font-bold">SOS</span>
          <span className="text-xs">Emergency</span>
        </div>
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emergency">
              <AlertTriangle className="h-6 w-6" />
              Activate Emergency Alert?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Share your location with emergency contacts</li>
                <li>Send your medical information</li>
                <li>Alert emergency services</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-emergency hover:bg-emergency/90">
              Confirm Emergency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencyButton;
