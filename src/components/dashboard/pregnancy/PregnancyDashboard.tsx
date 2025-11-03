import { useState, useEffect } from "react";
import { PregnancyProgressCard } from "./PregnancyProgressCard";
import { AIInsightCard } from "./AIInsightCard";
import { MedicalAlertCard } from "./MedicalAlertCard";
import { TrimesterMilestoneCard } from "./TrimesterMilestoneCard";
import { PreparationChecklistCard } from "./PreparationChecklistCard";
import { TipNuggetCard } from "../feed/TipNuggetCard";
import { CommunityFeedCard } from "../feed/CommunityFeedCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductRecommendations from "@/components/ProductRecommendations";

interface Baby {
  id: string;
  name: string;
  user_id: string;
  due_date: string;
  pregnancy_week: number;
  is_pregnancy: boolean;
}

interface PregnancyDashboardProps {
  baby: Baby;
  aiSummary: string;
}

export const PregnancyDashboard = ({ baby, aiSummary }: PregnancyDashboardProps) => {
  const navigate = useNavigate();
  const currentWeek = baby.pregnancy_week || 0;
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
  
  const [tips, setTips] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPregnancyContent();
  }, [trimester]);

  const fetchPregnancyContent = async () => {
    // Fetch pregnancy tips (negative weeks in min_age_weeks)
    const { data: tipsData } = await supabase
      .from('parenting_tips')
      .select('*')
      .lte('min_age_weeks', -currentWeek)
      .gte('max_age_weeks', -currentWeek)
      .order('priority', { ascending: false })
      .limit(4);

    if (tipsData) setTips(tipsData);

    // Fetch community posts from other pregnant users
    const { data: postsData } = await supabase
      .from('social_posts')
      .select(`
        *,
        profiles!inner(display_name, first_name, last_name),
        babies!inner(is_pregnancy, pregnancy_week)
      `)
      .eq('babies.is_pregnancy', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (postsData) setCommunityPosts(postsData);
  };

  const handleMarkBabyBorn = async () => {
    const { error } = await supabase
      .from('babies')
      .update({
        is_pregnancy: false,
        birthdate: new Date().toISOString().split('T')[0],
        pregnancy_week: null,
        due_date: null
      })
      .eq('id', baby.id);

    if (error) {
      toast.error("Failed to update baby status");
    } else {
      toast.success("🎉 Congratulations! Welcome to parenthood!");
      // Trigger confetti effect (you can add a library like canvas-confetti)
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 space-y-6 py-6">
        {/* Progress Overview */}
        <PregnancyProgressCard 
          dueDate={baby.due_date}
          currentWeek={currentWeek}
          trimester={trimester}
        />

        {/* AI Insight */}
        <AIInsightCard 
          babyName={baby.name}
          aiSummary={aiSummary}
          currentWeek={currentWeek}
        />

        {/* Medical Alerts */}
        <MedicalAlertCard 
          babyId={baby.id}
          currentWeek={currentWeek}
        />

        {/* Trimester Milestones */}
        <TrimesterMilestoneCard 
          trimester={trimester}
          currentWeek={currentWeek}
        />

        {/* Preparation Checklist */}
        <PreparationChecklistCard 
          trimester={trimester}
          babyId={baby.id}
        />
      </div>

      {/* PRIMARY MONETIZATION ZONE - Smart Product Recommendations */}
      <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-y-2 border-primary/10 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <ProductRecommendations
            babyId={baby.id}
            babyName={baby.name}
            isPregnancy={true}
            pregnancyWeek={currentWeek}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6 py-6 opacity-90">
        {/* Parenting Tips */}
        {tips.map((tip, idx) => (
          <TipNuggetCard key={idx} tip={tip} />
        ))}

        {/* Community Posts */}
        {communityPosts.map((post, idx) => (
          <CommunityFeedCard key={idx} post={post} />
        ))}
      </div>

      {/* Mark Baby Born Button (show in trimester 3) */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {trimester === 3 && currentWeek >= 37 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <PartyPopper className="w-8 h-8 text-success" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Baby Arrived?</h3>
              <p className="text-sm text-muted-foreground">Congratulations! Mark your baby as born to switch to parenting mode.</p>
            </div>
          </div>
          <Button 
            onClick={handleMarkBabyBorn}
            className="w-full bg-success hover:bg-success/90 text-white font-semibold"
          >
            <PartyPopper className="w-4 h-4 mr-2" />
            My Baby is Here!
          </Button>
        </div>
        )}
      </div>
    </div>
  );
};
