import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone_number: string;
  email: string;
  priority: number;
}

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phone_number: "",
    email: "",
    priority: 1,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching contacts:', error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('emergency_contacts')
      .insert([{ ...newContact, user_id: user.id }]);

    if (error) {
      toast.error("Failed to add contact");
      console.error('Error adding contact:', error);
    } else {
      toast.success("Contact added successfully");
      setDialogOpen(false);
      setNewContact({ name: "", relationship: "", phone_number: "", email: "", priority: 1 });
      fetchContacts();
    }
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete contact");
      console.error('Error deleting contact:', error);
    } else {
      toast.success("Contact deleted");
      fetchContacts();
    }
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
          <h1 className="text-xl font-bold">Emergency Contacts</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Manage your emergency contacts</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
                <DialogDescription>Add a new person to your emergency contact list</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    placeholder="e.g., Parent, Spouse, Friend"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={newContact.phone_number}
                    onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newContact.priority}
                    onChange={(e) => setNewContact({ ...newContact, priority: parseInt(e.target.value) })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Contact</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No emergency contacts added yet</p>
                <p className="text-sm mt-2">Add contacts who should be notified in emergencies</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription>
                        {contact.relationship && `${contact.relationship} • `}
                        Priority {contact.priority}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone_number}`} className="text-primary hover:underline">
                      {contact.phone_number}
                    </a>
                  </div>
                  {contact.email && (
                    <div className="text-sm text-muted-foreground">
                      {contact.email}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Contacts;
