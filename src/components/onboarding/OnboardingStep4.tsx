import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Step4Data {
  interests: string[];
  emailNotifications: string[];
}

interface Step4Props {
  onNext: (data: Step4Data) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData: Step4Data;
}

const INTERESTS = [
  { id: "milestones", label: "Milestone tracking & development" },
  { id: "sleep", label: "Sleep guidance & tips" },
  { id: "nutrition", label: "Nutrition & feeding advice" },
  { id: "products", label: "Product recommendations" },
  { id: "marketplace", label: "Local marketplace" },
  { id: "community", label: "Community discussions" },
];

const EMAIL_PREFERENCES = [
  { id: "weekly", label: "Weekly milestone updates" },
  { id: "predictions", label: "AI predictions & insights" },
  { id: "deals", label: "Marketplace deals & new listings" },
  { id: "community", label: "Community highlights" },
];

export const OnboardingStep4 = ({ onNext, onBack, onSkip, initialData }: Step4Props) => {
  const [interests, setInterests] = useState<string[]>(initialData.interests);
  const [emailNotifications, setEmailNotifications] = useState<string[]>(initialData.emailNotifications);

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleEmailPref = (id: string) => {
    setEmailNotifications(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ interests, emailNotifications });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Customize Your Experience</h2>
        <p className="text-muted-foreground">
          Select what matters most to you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">What are you interested in?</Label>
          <div className="space-y-3 border rounded-lg p-4">
            {INTERESTS.map(interest => (
              <div key={interest.id} className="flex items-center space-x-2">
                <Checkbox
                  id={interest.id}
                  checked={interests.includes(interest.id)}
                  onCheckedChange={() => toggleInterest(interest.id)}
                />
                <label
                  htmlFor={interest.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {interest.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Email notifications</Label>
          <p className="text-xs text-muted-foreground">
            Choose what updates you'd like to receive
          </p>
          <div className="space-y-3 border rounded-lg p-4">
            {EMAIL_PREFERENCES.map(pref => (
              <div key={pref.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`email-${pref.id}`}
                  checked={emailNotifications.includes(pref.id)}
                  onCheckedChange={() => toggleEmailPref(pref.id)}
                />
                <label
                  htmlFor={`email-${pref.id}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {pref.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};
