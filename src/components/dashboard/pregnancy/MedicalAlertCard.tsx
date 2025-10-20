import { useState, useEffect } from "react";
import { AlertCircle, Calendar, CheckCircle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Alert {
  id: string;
  title: string;
  description: string | null;
  due_week: number;
  priority: string;
  completed: boolean;
  alert_type: string;
}

interface MedicalAlertCardProps {
  babyId: string;
  currentWeek: number;
}

export const MedicalAlertCard = ({ babyId, currentWeek }: MedicalAlertCardProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [babyId, currentWeek]);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('pregnancy_alerts')
      .select('*')
      .eq('baby_id', babyId)
      .gte('due_week', currentWeek - 2)
      .lte('due_week', currentWeek + 8)
      .order('due_week', { ascending: true });

    if (error) {
      console.error('Error fetching alerts:', error);
      toast.error("Failed to load medical alerts");
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const handleToggleComplete = async (alertId: string, completed: boolean) => {
    const { error } = await supabase
      .from('pregnancy_alerts')
      .update({ 
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null
      })
      .eq('id', alertId);

    if (error) {
      toast.error("Failed to update alert");
    } else {
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, completed: !completed } : a
      ));
      toast.success(!completed ? "Alert marked complete" : "Alert reopened");
    }
  };

  const getPriorityStyles = (priority: string, completed: boolean) => {
    if (completed) return "bg-success/10 border-success/30";
    
    switch (priority) {
      case 'high': return "bg-destructive/10 border-destructive/50";
      case 'medium': return "bg-warning/10 border-warning/50";
      default: return "bg-muted border-border";
    }
  };

  const getIcon = (alertType: string) => {
    switch (alertType) {
      case 'appointment': return Calendar;
      case 'screening': return Shield;
      default: return AlertCircle;
    }
  };

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Medical Alerts</h3>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => {
          const Icon = getIcon(alert.alert_type);
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${getPriorityStyles(alert.priority, alert.completed)}`}
            >
              <Checkbox
                checked={alert.completed}
                onCheckedChange={() => handleToggleComplete(alert.id, alert.completed)}
                className="mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className={`font-semibold ${alert.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {alert.title}
                  </span>
                  <span className="text-xs text-muted-foreground">• Week {alert.due_week}</span>
                  {!alert.completed && alert.priority === 'high' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
                      Urgent
                    </span>
                  )}
                </div>
                {alert.description && (
                  <p className={`text-sm ${alert.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                    {alert.description}
                  </p>
                )}
              </div>

              {alert.completed && (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
