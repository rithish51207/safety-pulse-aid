import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    blood_type: "",
    date_of_birth: "",
    weight: "",
    height: "",
    allergies: "",
    medications: "",
    organ_donor: false,
    residential_address: "",
    permanent_address: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone_number: data.phone_number || "",
        blood_type: data.blood_type || "",
        date_of_birth: data.date_of_birth || "",
        weight: data.weight ? data.weight.toString() : "",
        height: data.height ? data.height.toString() : "",
        allergies: data.allergies || "",
        medications: data.medications || "",
        organ_donor: data.organ_donor || false,
        residential_address: data.residential_address || "",
        permanent_address: data.permanent_address || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        height: profile.height ? parseFloat(profile.height) : null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error("Failed to save profile");
      console.error('Error saving profile:', error);
    } else {
      toast.success("Profile saved successfully");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Medical Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Personal & Medical Information</CardTitle>
            <CardDescription>This information will be shared with emergency services when needed</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Blood Type</Label>
                  <Input
                    id="blood_type"
                    placeholder="e.g., A+, O-, AB+"
                    value={profile.blood_type}
                    onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any allergies..."
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List current medications..."
                  value={profile.medications}
                  onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="organ_donor"
                  checked={profile.organ_donor}
                  onCheckedChange={(checked) => setProfile({ ...profile, organ_donor: checked })}
                />
                <Label htmlFor="organ_donor">Organ Donor</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="residential_address">Residential Address</Label>
                <Textarea
                  id="residential_address"
                  placeholder="Enter your residential address..."
                  value={profile.residential_address}
                  onChange={(e) => setProfile({ ...profile, residential_address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permanent_address">Permanent Address</Label>
                <Textarea
                  id="permanent_address"
                  placeholder="Enter your permanent address..."
                  value={profile.permanent_address}
                  onChange={(e) => setProfile({ ...profile, permanent_address: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
