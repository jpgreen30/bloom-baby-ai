import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Step3Data {
  babyStatus: "pregnant" | "born";
  babyName: string;
  birthdate: string;
  dueDate: string;
  pregnancyWeek: string;
  gender: string;
  birthWeight: string;
  notes: string;
}

interface Step3Props {
  onNext: (data: Step3Data) => void;
  onBack: () => void;
  initialData: Step3Data;
}

export const OnboardingStep3 = ({ onNext, onBack, initialData }: Step3Props) => {
  const [babyStatus, setBabyStatus] = useState<"pregnant" | "born">(initialData.babyStatus);
  const [babyName, setBabyName] = useState(initialData.babyName);
  const [birthdate, setBirthdate] = useState(initialData.birthdate);
  const [dueDate, setDueDate] = useState(initialData.dueDate);
  const [pregnancyWeek, setPregnancyWeek] = useState(initialData.pregnancyWeek);
  const [gender, setGender] = useState(initialData.gender);
  const [birthWeight, setBirthWeight] = useState(initialData.birthWeight);
  const [notes, setNotes] = useState(initialData.notes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (babyStatus === "born") {
      if (!babyName.trim()) {
        toast.error("Please enter your baby's name");
        return;
      }
      if (!birthdate) {
        toast.error("Please enter your baby's birthday");
        return;
      }
      if (new Date(birthdate) > new Date()) {
        toast.error("Birthday cannot be in the future");
        return;
      }
    } else {
      if (!babyName.trim()) {
        toast.error("Please enter a nickname for your baby");
        return;
      }
      if (!dueDate && !pregnancyWeek) {
        toast.error("Please enter either a due date or pregnancy week");
        return;
      }
      if (dueDate && new Date(dueDate) < new Date()) {
        toast.error("Due date should be in the future");
        return;
      }
      if (pregnancyWeek && (parseInt(pregnancyWeek) < 1 || parseInt(pregnancyWeek) > 42)) {
        toast.error("Pregnancy week must be between 1 and 42");
        return;
      }
    }

    onNext({
      babyStatus,
      babyName: babyName.trim(),
      birthdate,
      dueDate,
      pregnancyWeek,
      gender,
      birthWeight,
      notes: notes.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Tell Us About Your Baby</h2>
        <p className="text-muted-foreground">
          This helps us provide personalized milestone tracking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Label>Current Status*</Label>
          <RadioGroup value={babyStatus} onValueChange={(value: "pregnant" | "born") => setBabyStatus(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pregnant" id="pregnant" />
              <Label htmlFor="pregnant" className="font-normal cursor-pointer">
                I'm pregnant
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="born" id="born" />
              <Label htmlFor="born" className="font-normal cursor-pointer">
                My baby is born
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="babyName">
            {babyStatus === "born" ? "Baby's Name*" : "Baby's Nickname*"}
          </Label>
          <Input
            id="babyName"
            placeholder={babyStatus === "born" ? "Emma" : "Little Bean"}
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            required
            maxLength={50}
          />
        </div>

        {babyStatus === "born" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Birthday*</Label>
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
                placeholder="7.5"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pregnancyWeek">Current Pregnancy Week</Label>
              <Input
                id="pregnancyWeek"
                type="number"
                min="1"
                max="42"
                placeholder="e.g., 20"
                value={pregnancyWeek}
                onChange={(e) => setPregnancyWeek(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a number between 1 and 42
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special considerations or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};
