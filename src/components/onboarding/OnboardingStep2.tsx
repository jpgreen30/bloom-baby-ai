import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Step2Props {
  onNext: (data: { firstName: string; lastName: string; phone: string; zipCode: string }) => void;
  onBack: () => void;
  initialData: { firstName: string; lastName: string; phone: string; zipCode: string };
}

export const OnboardingStep2 = ({ onNext, onBack, initialData }: Step2Props) => {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [phone, setPhone] = useState(initialData.phone);
  const [zipCode, setZipCode] = useState(initialData.zipCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }

    if (firstName.length > 50 || lastName.length > 50) {
      toast.error("Names must be less than 50 characters");
      return;
    }

    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s()-]/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      toast.error("Please enter a valid ZIP code (12345 or 12345-6789)");
      return;
    }

    onNext({ 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      phone: phone.replace(/[\s()-]/g, ''), 
      zipCode: zipCode.trim() 
    });
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Tell Us About You</h2>
        <p className="text-muted-foreground">
          Help us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name*</Label>
          <Input
            id="firstName"
            placeholder="Sarah"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name*</Label>
          <Input
            id="lastName"
            placeholder="Johnson"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            maxLength={14}
          />
          <p className="text-xs text-muted-foreground">
            For account recovery and notifications
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code (optional)</Label>
          <Input
            id="zipCode"
            placeholder="12345"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            maxLength={10}
          />
          <p className="text-xs text-muted-foreground">
            To show you local marketplace items and community events
          </p>
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
