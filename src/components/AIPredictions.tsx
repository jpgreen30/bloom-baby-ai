import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIPredictionsProps {
  babyName: string;
  babyAge: {
    months: number;
    weeks: number;
  };
  completedMilestones: any[];
  upcomingMilestones: any[];
}

export const AIPredictions = ({
  babyName,
  babyAge,
  completedMilestones,
  upcomingMilestones,
}: AIPredictionsProps) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("milestone-predictions", {
        body: {
          babyName,
          babyAge,
          completedMilestones,
          upcomingMilestones,
        },
      });

      if (error) throw error;
      setPrediction(data.prediction);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate predictions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <CardDescription>
          Get personalized predictions about {babyName}'s development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction && (
          <Button onClick={generatePredictions} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing progress...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Predictions
              </>
            )}
          </Button>
        )}
        {prediction && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{prediction}</div>
            </div>
            <Button
              onClick={generatePredictions}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Refresh Predictions"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
