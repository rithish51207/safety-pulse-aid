import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin } from "lucide-react";

interface DisasterAlert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  location: string;
  created_at: string;
}

const DisasterAlerts = () => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('disaster-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disaster_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('disaster_alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-emergency text-emergency-foreground';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
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
          <Bell className="h-5 w-5 text-primary" />
          Natural Disaster Alerts
        </CardTitle>
        <CardDescription>Live alerts for nearby locations</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No active alerts in your area</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-lg border border-border hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline">{alert.alert_type}</Badge>
                  </div>
                </div>
                <h4 className="font-semibold mb-1">{alert.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {alert.location}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisasterAlerts;
