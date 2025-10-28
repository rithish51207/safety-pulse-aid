import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Phone, MapPin, Bell, User as UserIcon, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import EmergencyButton from "@/components/EmergencyButton";
import CrimeZones from "@/components/CrimeZones";
import DisasterAlerts from "@/components/DisasterAlerts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleEmergencyCall = (number: string) => {
    window.location.href = `tel:${number}`;
    toast.success(`Calling ${number}...`);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          
          if (navigator.share) {
            navigator.share({
              title: 'Emergency Location',
              text: 'I need help! Here is my location:',
              url: locationUrl,
            }).then(() => {
              toast.success("Location shared successfully");
            }).catch((error) => {
              console.error('Error sharing:', error);
              toast.error("Failed to share location");
            });
          } else {
            navigator.clipboard.writeText(locationUrl);
            toast.success("Location copied to clipboard");
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error("Failed to get location");
        }
      );
    } else {
      toast.error("Geolocation is not supported");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Shield className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Emergency Alert</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="text-center">
          <EmergencyButton />
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Card className="border-emergency/20 hover:border-emergency/40 transition-all cursor-pointer" onClick={() => handleEmergencyCall('112')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emergency" />
                Police (112)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Emergency police assistance</p>
            </CardContent>
          </Card>

          <Card className="border-emergency/20 hover:border-emergency/40 transition-all cursor-pointer" onClick={() => handleEmergencyCall('100')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emergency" />
                Fire (100)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Fire emergency services</p>
            </CardContent>
          </Card>

          <Card className="border-emergency/20 hover:border-emergency/40 transition-all cursor-pointer" onClick={() => handleEmergencyCall('108')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emergency" />
                Ambulance (108)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Medical emergency services</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Share Location
              </CardTitle>
              <CardDescription>Share your current location with emergency contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleShareLocation} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Share My Location
              </Button>
            </CardContent>
          </Card>
        </section>

        <CrimeZones />
        <DisasterAlerts />

        <section className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => navigate("/profile")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Medical Profile
              </CardTitle>
              <CardDescription>Manage your medical information</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => navigate("/contacts")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>Manage your emergency contacts</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
