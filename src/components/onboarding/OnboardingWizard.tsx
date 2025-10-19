import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import { OnboardingStep4 } from "./OnboardingStep4";
import { OnboardingStep5 } from "./OnboardingStep5";
import { toast } from "sonner";

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    zipCode: "",
    babyStatus: "born" as "pregnant" | "born",
    babyName: "",
    birthdate: "",
    dueDate: "",
    pregnancyWeek: "",
    gender: "",
    birthWeight: "",
    notes: "",
    interests: [] as string[],
    emailNotifications: [] as string[],
  });

  useEffect(() => {
    checkAuthAndStep();
  }, []);

  const checkAuthAndStep = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUserId(user.id);
      
      // Check if user already completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, onboarding_step, first_name, last_name, phone, zip_code, email")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
        return;
      }

      // Resume from saved step
      if (profile?.onboarding_step && profile.onboarding_step > 1) {
        setCurrentStep(profile.onboarding_step);
        setFormData(prev => ({
          ...prev,
          email: profile.email || "",
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          phone: profile.phone || "",
          zipCode: profile.zip_code || "",
        }));
      } else {
        // User is authenticated but needs to complete onboarding starting from step 2
        setCurrentStep(2);
      }
    } else {
      // Check if there's a step parameter in URL (for email confirmation)
      const stepParam = searchParams.get("step");
      if (stepParam) {
        const step = parseInt(stepParam);
        if (step >= 1 && step <= 5) {
          setCurrentStep(step);
        }
      }
    }
    
    setLoading(false);
  };

  const saveProgress = async (step: number, data: Partial<typeof formData>) => {
    if (!userId) return;

    try {
      const profileUpdate: any = {
        onboarding_step: step,
      };

      if (data.firstName) profileUpdate.first_name = data.firstName;
      if (data.lastName) profileUpdate.last_name = data.lastName;
      if (data.phone) profileUpdate.phone = data.phone;
      if (data.zipCode) profileUpdate.zip_code = data.zipCode;

      await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleStep1Complete = async (data: { email: string; password: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    // After signup, user should be authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
    
    setCurrentStep(2);
  };

  const handleStep2Complete = async (data: { firstName: string; lastName: string; phone: string; zipCode: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
    await saveProgress(3, data);
    setCurrentStep(3);
  };

  const handleStep3Complete = async (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    // Save baby information
    if (userId) {
      try {
        const babyData: any = {
          user_id: userId,
          name: data.babyName,
          notes: data.notes || null,
        };

        if (data.babyStatus === "born") {
          babyData.birthdate = data.birthdate;
          babyData.gender = data.gender || null;
          babyData.birth_weight = data.birthWeight ? parseFloat(data.birthWeight) : null;
          babyData.is_pregnancy = false;
        } else {
          babyData.is_pregnancy = true;
          babyData.due_date = data.dueDate || null;
          babyData.pregnancy_week = data.pregnancyWeek ? parseInt(data.pregnancyWeek) : null;
        }

        const { error } = await supabase.from("babies").insert(babyData);
        if (error) throw error;

        await saveProgress(4, {});
      } catch (error: any) {
        toast.error(error.message || "Failed to save baby information");
        return;
      }
    }
    
    setCurrentStep(4);
  };

  const handleStep4Complete = async (data: { interests: string[]; emailNotifications: string[] }) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    // Save preferences
    if (userId) {
      try {
        await supabase.from("user_preferences").insert({
          user_id: userId,
          interests: data.interests,
          email_notifications: data.emailNotifications,
        });
      } catch (error: any) {
        console.error("Error saving preferences:", error);
      }
    }
    
    // Mark onboarding as complete
    await completeOnboarding();
    setCurrentStep(5);
  };

  const handleStep4Skip = async () => {
    await completeOnboarding();
    setCurrentStep(5);
  };

  const completeOnboarding = async () => {
    if (!userId) return;

    try {
      await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true,
          onboarding_step: 5
        })
        .eq("id", userId);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const progressPercentage = (currentStep / 5) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {currentStep < 5 && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Step {currentStep} of 5</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="bg-background rounded-lg shadow-lg p-6 md:p-8">
          {currentStep === 1 && (
            <OnboardingStep1
              onNext={handleStep1Complete}
              initialData={{ email: formData.email, password: formData.password }}
            />
          )}
          
          {currentStep === 2 && (
            <OnboardingStep2
              onNext={handleStep2Complete}
              onBack={() => setCurrentStep(1)}
              initialData={{
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                zipCode: formData.zipCode,
              }}
            />
          )}
          
          {currentStep === 3 && (
            <OnboardingStep3
              onNext={handleStep3Complete}
              onBack={() => setCurrentStep(2)}
              initialData={{
                babyStatus: formData.babyStatus,
                babyName: formData.babyName,
                birthdate: formData.birthdate,
                dueDate: formData.dueDate,
                pregnancyWeek: formData.pregnancyWeek,
                gender: formData.gender,
                birthWeight: formData.birthWeight,
                notes: formData.notes,
              }}
            />
          )}
          
          {currentStep === 4 && (
            <OnboardingStep4
              onNext={handleStep4Complete}
              onBack={() => setCurrentStep(3)}
              onSkip={handleStep4Skip}
              initialData={{
                interests: formData.interests,
                emailNotifications: formData.emailNotifications,
              }}
            />
          )}
          
          {currentStep === 5 && (
            <OnboardingStep5
              userData={{
                firstName: formData.firstName,
                babyName: formData.babyName,
                babyStatus: formData.babyStatus,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
