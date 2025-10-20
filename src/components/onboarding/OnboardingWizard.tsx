import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep2_5 } from "./OnboardingStep2_5";
import { OnboardingStep3 } from "./OnboardingStep3";
import { OnboardingStep4 } from "./OnboardingStep4";
import { OnboardingStep5 } from "./OnboardingStep5";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";

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
    household_income: "",
    baby_budget_monthly: "",
    education_level: "",
    housing_status: "",
    household_size: 2,
    employment_status: "",
    partner_status: "",
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
        .select("onboarding_completed, onboarding_step, first_name, last_name, phone, zip_code, email, household_income, baby_budget_monthly, education_level, housing_status, household_size, employment_status, partner_status")
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
          household_income: profile.household_income || "",
          baby_budget_monthly: profile.baby_budget_monthly || "",
          education_level: profile.education_level || "",
          housing_status: profile.housing_status || "",
          household_size: profile.household_size || 2,
          employment_status: profile.employment_status || "",
          partner_status: profile.partner_status || "",
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
        if (step >= 1 && step <= 6) {
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
      if (data.household_income !== undefined) profileUpdate.household_income = data.household_income;
      if (data.baby_budget_monthly !== undefined) profileUpdate.baby_budget_monthly = data.baby_budget_monthly;
      if (data.education_level !== undefined) profileUpdate.education_level = data.education_level;
      if (data.housing_status !== undefined) profileUpdate.housing_status = data.housing_status;
      if (data.household_size !== undefined) profileUpdate.household_size = data.household_size;
      if (data.employment_status !== undefined) profileUpdate.employment_status = data.employment_status;
      if (data.partner_status !== undefined) profileUpdate.partner_status = data.partner_status;

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

  const handleStep2_5Complete = async (data: { 
    household_income: string; 
    baby_budget_monthly: string; 
    education_level: string; 
    housing_status: string; 
    household_size: number; 
    employment_status: string; 
    partner_status: string 
  }) => {
    setFormData(prev => ({ ...prev, ...data }));
    await saveProgress(4, data);
    setCurrentStep(4);
  };

  const handleStep2_5Skip = async () => {
    await saveProgress(4, {});
    setCurrentStep(4);
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
          // For pregnancies, explicitly set birthdate as null
          babyData.birthdate = null;
          babyData.is_pregnancy = true;
          babyData.due_date = data.dueDate || null;
          
          // Calculate pregnancy week from due date if not provided
          if (data.pregnancyWeek) {
            babyData.pregnancy_week = parseInt(data.pregnancyWeek);
          } else if (data.dueDate) {
            const dueDate = new Date(data.dueDate);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const weeksUntilDue = Math.ceil(daysUntilDue / 7);
            babyData.pregnancy_week = Math.max(1, Math.min(42, 40 - weeksUntilDue));
          } else {
            babyData.pregnancy_week = null;
          }
        }

        const { error } = await supabase.from("babies").insert(babyData);
        
        if (error) {
          console.error("Database error saving baby:", error);
          throw new Error("Unable to save baby information. Please try again.");
        }

        await saveProgress(5, {});
      } catch (error: any) {
        console.error("Error in handleStep3Complete:", error);
        toast.error(error.message || "Failed to save baby information");
        return;
      }
    }
    
    setCurrentStep(5);
  };

  const handleStep5Complete = async (data: { interests: string[]; emailNotifications: string[] }) => {
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
    setCurrentStep(6);
  };

  const handleStep5Skip = async () => {
    await completeOnboarding();
    setCurrentStep(6);
  };

  const completeOnboarding = async () => {
    if (!userId) return;

    try {
      await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true,
          onboarding_step: 6
        })
        .eq("id", userId);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const progressPercentage = (currentStep / 6) * 100;

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
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" clickable={false} />
        </div>

        {currentStep < 6 && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Step {currentStep} of 6</span>
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
            <OnboardingStep2_5
              onNext={handleStep2_5Complete}
              onBack={() => setCurrentStep(2)}
              onSkip={handleStep2_5Skip}
              initialData={{
                household_income: formData.household_income,
                baby_budget_monthly: formData.baby_budget_monthly,
                education_level: formData.education_level,
                housing_status: formData.housing_status,
                household_size: formData.household_size,
                employment_status: formData.employment_status,
                partner_status: formData.partner_status,
              }}
            />
          )}
          
          {currentStep === 4 && (
            <OnboardingStep3
              onNext={handleStep3Complete}
              onBack={() => setCurrentStep(3)}
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
          
          {currentStep === 5 && (
            <OnboardingStep4
              onNext={handleStep5Complete}
              onBack={() => setCurrentStep(4)}
              onSkip={handleStep5Skip}
              initialData={{
                interests: formData.interests,
                emailNotifications: formData.emailNotifications,
              }}
            />
          )}
          
          {currentStep === 6 && (
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
