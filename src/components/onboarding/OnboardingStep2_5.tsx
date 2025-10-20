import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Home, Users, Heart, Shield } from "lucide-react";

interface Step2_5Data {
  household_income: string;
  baby_budget_monthly: string;
  education_level: string;
  housing_status: string;
  household_size: number;
  employment_status: string;
  partner_status: string;
}

interface Step2_5Props {
  onNext: (data: Step2_5Data) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData: Step2_5Data;
}

export const OnboardingStep2_5 = ({ onNext, onBack, onSkip, initialData }: Step2_5Props) => {
  const [householdIncome, setHouseholdIncome] = useState(initialData.household_income || "");
  const [babyBudget, setBabyBudget] = useState(initialData.baby_budget_monthly || "");
  const [educationLevel, setEducationLevel] = useState(initialData.education_level || "");
  const [housingStatus, setHousingStatus] = useState(initialData.housing_status || "");
  const [householdSize, setHouseholdSize] = useState(initialData.household_size || 2);
  const [employmentStatus, setEmploymentStatus] = useState(initialData.employment_status || "");
  const [partnerStatus, setPartnerStatus] = useState(initialData.partner_status || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      household_income: householdIncome,
      baby_budget_monthly: babyBudget,
      education_level: educationLevel,
      housing_status: housingStatus,
      household_size: householdSize,
      employment_status: employmentStatus,
      partner_status: partnerStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Help Us Personalize Your Experience</h2>
        <p className="text-muted-foreground text-sm">
          This information helps us recommend products within your budget and connect you with families in similar situations
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
          <Shield className="w-4 h-4" />
          <span>Your information is private and secure</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Household Information */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Household Information
          </h3>

          <div className="space-y-2">
            <Label>Partner Status</Label>
            <RadioGroup value={partnerStatus} onValueChange={setPartnerStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="font-normal">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partnered" id="partnered" />
                <Label htmlFor="partnered" className="font-normal">Partnered</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="married" id="married" />
                <Label htmlFor="married" className="font-normal">Married</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer_not_to_say_partner" id="prefer_not_to_say_partner" />
                <Label htmlFor="prefer_not_to_say_partner" className="font-normal">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="householdSize">Household Size: {householdSize} {householdSize === 1 ? 'person' : 'people'}</Label>
            <Slider
              id="householdSize"
              min={1}
              max={10}
              step={1}
              value={[householdSize]}
              onValueChange={(value) => setHouseholdSize(value[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Housing Status</Label>
            <RadioGroup value={housingStatus} onValueChange={setHousingStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="own" id="own" />
                <Label htmlFor="own" className="font-normal flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Own
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rent" id="rent" />
                <Label htmlFor="rent" className="font-normal flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Rent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="living_with_family" id="living_with_family" />
                <Label htmlFor="living_with_family" className="font-normal">Living with family</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer_not_to_say_housing" id="prefer_not_to_say_housing" />
                <Label htmlFor="prefer_not_to_say_housing" className="font-normal">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Financial Planning */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Financial Planning
          </h3>

          <div className="space-y-2">
            <Label htmlFor="householdIncome">Household Income (Annual)</Label>
            <Select value={householdIncome} onValueChange={setHouseholdIncome}>
              <SelectTrigger id="householdIncome">
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_25k">Under $25,000</SelectItem>
                <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
                <SelectItem value="150k_plus">$150,000+</SelectItem>
                <SelectItem value="prefer_not_to_say_income">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="babyBudget">Monthly Baby Budget</Label>
            <Select value={babyBudget} onValueChange={setBabyBudget}>
              <SelectTrigger id="babyBudget">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_100">Under $100</SelectItem>
                <SelectItem value="100_250">$100 - $250</SelectItem>
                <SelectItem value="250_500">$250 - $500</SelectItem>
                <SelectItem value="500_1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000_plus">$1,000+</SelectItem>
                <SelectItem value="prefer_not_to_say_budget">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentStatus">Employment Status</Label>
            <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
              <SelectTrigger id="employmentStatus">
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed_full">Employed Full-Time</SelectItem>
                <SelectItem value="employed_part">Employed Part-Time</SelectItem>
                <SelectItem value="self_employed">Self-Employed</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="stay_at_home_parent">Stay-at-Home Parent</SelectItem>
                <SelectItem value="prefer_not_to_say_employment">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Background */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/30">
          <h3 className="font-semibold">Background</h3>

          <div className="space-y-2">
            <Label htmlFor="educationLevel">Education Level</Label>
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger id="educationLevel">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="some_college">Some College</SelectItem>
                <SelectItem value="associates">Associate's Degree</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="graduate">Graduate Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate</SelectItem>
                <SelectItem value="prefer_not_to_say_education">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};
