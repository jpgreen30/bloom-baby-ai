import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const [marketingEmails, setMarketingEmails] = useState<boolean>(false);
  const [productUpdates, setProductUpdates] = useState<boolean>(true);

  useEffect(() => {
    const me = localStorage.getItem("pref-marketing-emails");
    const pu = localStorage.getItem("pref-product-updates");
    if (me !== null) setMarketingEmails(me === "true");
    if (pu !== null) setProductUpdates(pu === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("pref-marketing-emails", String(marketingEmails));
  }, [marketingEmails]);

  useEffect(() => {
    localStorage.setItem("pref-product-updates", String(productUpdates));
  }, [productUpdates]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={theme ?? "system"} onValueChange={(val) => setTheme(val)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose the notifications you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Product updates</p>
              <p className="text-sm text-muted-foreground">Release notes and important changes.</p>
            </div>
            <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tips & marketing emails</p>
              <p className="text-sm text-muted-foreground">Occasional tips and offers.</p>
            </div>
            <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
