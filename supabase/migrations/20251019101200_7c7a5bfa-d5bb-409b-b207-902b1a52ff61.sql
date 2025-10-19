-- Create product recommendations table
CREATE TABLE public.product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  relevance_score NUMERIC NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  reason TEXT NOT NULL,
  recommended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clicked BOOLEAN DEFAULT false,
  purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add analytics columns to marketplace_listings
ALTER TABLE public.marketplace_listings
ADD COLUMN IF NOT EXISTS impression_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Enable RLS on product_recommendations
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_recommendations
CREATE POLICY "Users can view own recommendations"
ON public.product_recommendations
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert recommendations"
ON public.product_recommendations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own recommendations"
ON public.product_recommendations
FOR UPDATE
USING (user_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_product_recommendations_user_id ON public.product_recommendations(user_id);
CREATE INDEX idx_product_recommendations_listing_id ON public.product_recommendations(listing_id);
CREATE INDEX idx_product_recommendations_relevance ON public.product_recommendations(relevance_score DESC);