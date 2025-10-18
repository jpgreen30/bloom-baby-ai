import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_CONFIG, DEMO_PAYMENT_RESPONSES } from "@/config/payments";
import { toast } from "sonner";

export interface PurchaseParams {
  listingId: string;
  amount: number;
  buyerId: string;
  sellerId: string;
}

export const processPayment = async ({ listingId, amount, buyerId, sellerId }: PurchaseParams) => {
  if (PAYMENT_CONFIG.DEMO_MODE) {
    // Demo mode - simulate payment processing
    const paymentIntent = DEMO_PAYMENT_RESPONSES.createPaymentIntent(amount);
    
    const platformCommission = amount * PAYMENT_CONFIG.PLATFORM_COMMISSION_RATE;
    const sellerAmount = amount - platformCommission;
    
    // Create transaction record
    const { data, error } = await supabase.from("marketplace_transactions").insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount_total: amount,
      amount_seller: sellerAmount,
      platform_commission: platformCommission,
      status: "completed",
      stripe_payment_intent_id: paymentIntent.id,
    }).select().single();
    
    if (error) throw error;
    
    toast.success("Demo payment processed successfully! 🎉");
    return { transaction: data, paymentIntent };
  } else {
    // Real Stripe integration would go here
    throw new Error("Stripe integration not configured. Please add your API key.");
  }
};

export const createSellerAccount = async (userId: string) => {
  if (PAYMENT_CONFIG.DEMO_MODE) {
    // Demo mode - create mock seller account
    const account = DEMO_PAYMENT_RESPONSES.createConnectAccount(userId);
    
    const { data, error } = await supabase.from("seller_accounts").upsert({
      user_id: userId,
      stripe_account_id: account.id,
      onboarding_completed: true,
      payouts_enabled: true,
    }).select().single();
    
    if (error) throw error;
    
    toast.success("Demo seller account created! 🎉");
    return data;
  } else {
    throw new Error("Stripe integration not configured. Please add your API key.");
  }
};

export const getSellerAccount = async (userId: string) => {
  const { data, error } = await supabase
    .from("seller_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
