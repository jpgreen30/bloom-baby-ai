import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MilestoneCard } from "@/components/MilestoneCard";
import { AIPredictions } from "@/components/AIPredictions";
import ProductRecommendations from "@/components/ProductRecommendations";
import { BabyDevelopmentImage } from "@/components/BabyDevelopmentImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Baby, Calendar, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [baby, setBaby] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [babyMilestones, setBabyMilestones] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: babies } = await supabase.from("babies").select("*").eq("user_id", user.id).single();
    if (!babies) {
      navigate("/baby/setup");
      return;
    }

    const { data: milestonesData } = await supabase.from("milestones").select("*").order("order_index");
    const { data: babyMilestonesData } = await supabase.from("baby_milestones").select("*").eq("baby_id", babies.id);

    setBaby(babies);
    setMilestones(milestonesData || []);
    setBabyMilestones(babyMilestonesData || []);
    setLoading(false);
  };

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    const existing = babyMilestones.find(bm => bm.milestone_id === milestoneId);
    
    if (existing) {
      await supabase.from("baby_milestones").update({ 
        status, 
        achieved_at: status === "achieved" ? new Date().toISOString() : null 
      }).eq("id", existing.id);
    } else {
      await supabase.from("baby_milestones").insert({
        baby_id: baby.id,
        milestone_id: milestoneId,
        status,
        achieved_at: status === "achieved" ? new Date().toISOString() : null,
      });
    }
    
    loadData();
    toast.success("Milestone updated!");
  };

  const getAge = () => {
    const birthDate = new Date(baby.birthdate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(ageInDays / 30);
    const weeks = Math.floor(ageInDays / 7);
    return { months, weeks, days: ageInDays };
  };

  const filterMilestones = (category: string) => {
    return milestones.filter(m => category === "all" || m.category === category);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const age = getAge();
  const completedMilestones = milestones.filter(m => 
    babyMilestones.find(bm => bm.milestone_id === m.id && bm.status === "achieved")
  );
  const upcomingMilestones = milestones.filter(m => 
    !babyMilestones.find(bm => bm.milestone_id === m.id) && m.typical_age_weeks >= age.weeks
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Baby className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Baby to Bloom AI</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/community")}>
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button variant="outline" onClick={() => navigate("/marketplace")}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="bg-gradient-hero text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Baby className="w-8 h-8" />
              {baby.name}'s Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              {age.months} months ({age.weeks} weeks old)
            </div>
            <p className="mt-2 opacity-90">{completedMilestones.length} milestones achieved! 🎉</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <BabyDevelopmentImage
            babyName={baby.name}
            babyAge={age}
            isPregnancy={baby.is_pregnancy}
            pregnancyWeek={baby.pregnancy_week}
          />
          <AIPredictions
            babyName={baby.name}
            babyAge={age}
            completedMilestones={completedMilestones}
            upcomingMilestones={upcomingMilestones}
          />
        </div>

        <ProductRecommendations
          babyName={baby.name}
          babyAge={`${age.months} months (${age.weeks} weeks)`}
          isPregnancy={baby.is_pregnancy}
          pregnancyWeek={baby.pregnancy_week}
          completedMilestones={completedMilestones.map((m: any) => m.title)}
          upcomingMilestones={upcomingMilestones.map((m: any) => m.title)}
        />

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="motor">Motor</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
          </TabsList>
          {["all", "motor", "cognitive", "social", "language"].map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              {filterMilestones(category).map(milestone => {
                const babyMilestone = babyMilestones.find(bm => bm.milestone_id === milestone.id);
                return (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    status={babyMilestone?.status}
                    onStatusChange={(status) => updateMilestoneStatus(milestone.id, status)}
                  />
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
