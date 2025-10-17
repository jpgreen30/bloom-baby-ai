import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BabySetupForm } from "@/components/BabySetupForm";

const BabySetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user already has a baby profile
      const { data: babies } = await supabase
        .from("babies")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (babies && babies.length > 0) {
        navigate("/dashboard");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <BabySetupForm />;
};

export default BabySetup;
