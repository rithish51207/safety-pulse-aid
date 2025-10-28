import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle } from "lucide-react";

interface CrimeZone {
  id: string;
  zone_name: string;
  location: string;
  crime_level: string;
  last_updated: string;
}

const CrimeZones = () => {
  const [zones, setZones] = useState<CrimeZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrimeZones();
  }, []);

  const fetchCrimeZones = async () => {
    const { data, error } = await supabase
      .from('crime_zones')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching crime zones:', error);
    } else {
      setZones(data || []);
    }
    setLoading(false);
  };

  const getCrimeLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-emergency text-emergency-foreground';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Crime Level Indicators
        </CardTitle>
        <CardDescription>Current crime levels in nearby zones</CardDescription>
      </CardHeader>
      <CardContent>
        {zones.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No crime zone data available</p>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 transition-all">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{zone.zone_name}</p>
                    <p className="text-sm text-muted-foreground">{zone.location}</p>
                  </div>
                </div>
                <Badge className={getCrimeLevelColor(zone.crime_level)}>
                  {zone.crime_level}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrimeZones;
