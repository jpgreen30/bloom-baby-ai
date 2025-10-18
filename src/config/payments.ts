// Payment configuration - set DEMO_MODE to true to use mock payments
export const PAYMENT_CONFIG = {
  DEMO_MODE: true,
  PLATFORM_COMMISSION_RATE: 0.10, // 10% platform commission
};

// Demo mode payment responses
export const DEMO_PAYMENT_RESPONSES = {
  createPaymentIntent: (amount: number) => ({
    id: `demo_pi_${Date.now()}`,
    client_secret: `demo_secret_${Date.now()}`,
    status: 'succeeded',
    amount,
  }),
  
  createTransfer: (amount: number, sellerId: string) => ({
    id: `demo_tr_${Date.now()}`,
    amount,
    destination: sellerId,
    status: 'completed',
  }),
  
  createConnectAccount: (userId: string) => ({
    id: `demo_acct_${Date.now()}`,
    type: 'express',
    charges_enabled: true,
    payouts_enabled: true,
  }),
};
