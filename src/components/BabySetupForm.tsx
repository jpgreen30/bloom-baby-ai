import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const BabySetupForm = () => {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [birthWeight, setBirthWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("babies").insert({
        user_id: user.id,
        name,
        birthdate,
        gender: gender || null,
        birth_weight: birthWeight ? parseFloat(birthWeight) : null,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success(`Welcome, ${name}! Let's track those milestones!`);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create baby profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-lg shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl">Create Baby Profile</CardTitle>
          <CardDescription>
            Tell us about your little one to get personalized milestone tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Baby's Name*</Label>
              <Input
                id="name"
                placeholder="e.g., Emma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Birthdate*</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender (optional)</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="girl">Girl</SelectItem>
                  <SelectItem value="boy">Boy</SelectItem>
                  <SelectItem value="other">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthWeight">Birth Weight (lbs, optional)</Label>
              <Input
                id="birthWeight"
                type="number"
                step="0.1"
                placeholder="e.g., 7.5"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special considerations or notes about your baby..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Profile..." : "Start Tracking Milestones"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
