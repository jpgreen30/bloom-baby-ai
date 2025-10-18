-- Create marketplace tables

-- Marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) <= 1000),
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC CHECK (original_price >= price OR original_price IS NULL),
  category TEXT NOT NULL CHECK (category IN ('clothing', 'toys', 'gear', 'feeding', 'books', 'furniture', 'other')),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  age_range TEXT CHECK (age_range IN ('0-3m', '3-6m', '6-12m', '12-18m', '18-24m', '2-3y', '3y+')),
  brand TEXT,
  size TEXT,
  location_city TEXT,
  location_state TEXT,
  shipping_available BOOLEAN DEFAULT true,
  local_pickup BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'deleted')),
  view_count INTEGER DEFAULT 0,
  favorited_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE
);

-- Marketplace images table
CREATE TABLE public.marketplace_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seller accounts table
CREATE TABLE public.seller_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  rating_average NUMERIC DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketplace transactions table
CREATE TABLE public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_total NUMERIC NOT NULL,
  amount_seller NUMERIC NOT NULL,
  platform_commission NUMERIC NOT NULL,
  stripe_fee NUMERIC DEFAULT 0,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed', 'cancelled')),
  shipping_method TEXT CHECK (shipping_method IN ('shipped', 'local_pickup')),
  tracking_number TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  buyer_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketplace favorites table
CREATE TABLE public.marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Marketplace reviews table
CREATE TABLE public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.marketplace_transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (char_length(comment) <= 500),
  review_type TEXT NOT NULL CHECK (review_type IN ('buyer_to_seller', 'seller_to_buyer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, reviewer_id)
);

-- Marketplace messages table
CREATE TABLE public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings FOR SELECT
USING (status = 'active');

CREATE POLICY "Sellers can view their own listings"
ON public.marketplace_listings FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Users can create listings"
ON public.marketplace_listings FOR INSERT
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own listings"
ON public.marketplace_listings FOR UPDATE
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own listings"
ON public.marketplace_listings FOR DELETE
USING (seller_id = auth.uid());

-- RLS Policies for marketplace_images
CREATE POLICY "Anyone can view images of active listings"
ON public.marketplace_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings
    WHERE id = marketplace_images.listing_id
    AND (status = 'active' OR seller_id = auth.uid())
  )
);

CREATE POLICY "Sellers can insert images for their listings"
ON public.marketplace_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings
    WHERE id = marketplace_images.listing_id AND seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can delete their listing images"
ON public.marketplace_images FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings
    WHERE id = marketplace_images.listing_id AND seller_id = auth.uid()
  )
);

-- RLS Policies for seller_accounts
CREATE POLICY "Anyone can view seller accounts"
ON public.seller_accounts FOR SELECT
USING (true);

CREATE POLICY "Users can create own seller account"
ON public.seller_accounts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own seller account"
ON public.seller_accounts FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for marketplace_transactions
CREATE POLICY "Users can view own transactions"
ON public.marketplace_transactions FOR SELECT
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create transactions"
ON public.marketplace_transactions FOR INSERT
WITH CHECK (buyer_id = auth.uid() AND buyer_id != seller_id);

CREATE POLICY "Transaction parties can update"
ON public.marketplace_transactions FOR UPDATE
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- RLS Policies for marketplace_favorites
CREATE POLICY "Users can view own favorites"
ON public.marketplace_favorites FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
ON public.marketplace_favorites FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
ON public.marketplace_favorites FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for marketplace_reviews
CREATE POLICY "Anyone can view reviews"
ON public.marketplace_reviews FOR SELECT
USING (true);

CREATE POLICY "Transaction parties can create reviews"
ON public.marketplace_reviews FOR INSERT
WITH CHECK (reviewer_id = auth.uid());

-- RLS Policies for marketplace_messages
CREATE POLICY "Users can view own messages"
ON public.marketplace_messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.marketplace_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update read status"
ON public.marketplace_messages FOR UPDATE
USING (recipient_id = auth.uid());

-- Triggers for updated_at timestamps
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_seller_accounts_updated_at
BEFORE UPDATE ON public.seller_accounts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_marketplace_transactions_updated_at
BEFORE UPDATE ON public.marketplace_transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to update favorited_count
CREATE OR REPLACE FUNCTION public.update_listing_favorited_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE marketplace_listings
    SET favorited_count = favorited_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE marketplace_listings
    SET favorited_count = favorited_count - 1
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for favorited_count
CREATE TRIGGER update_favorited_count_on_favorite
AFTER INSERT OR DELETE ON public.marketplace_favorites
FOR EACH ROW EXECUTE FUNCTION public.update_listing_favorited_count();

-- Function to update seller rating
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE seller_accounts
  SET 
    rating_count = (
      SELECT COUNT(*) FROM marketplace_reviews
      WHERE reviewee_id = NEW.reviewee_id AND review_type = 'buyer_to_seller'
    ),
    rating_average = (
      SELECT AVG(rating) FROM marketplace_reviews
      WHERE reviewee_id = NEW.reviewee_id AND review_type = 'buyer_to_seller'
    )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$;

-- Trigger for seller rating updates
CREATE TRIGGER update_seller_rating_on_review
AFTER INSERT ON public.marketplace_reviews
FOR EACH ROW
WHEN (NEW.review_type = 'buyer_to_seller')
EXECUTE FUNCTION public.update_seller_rating();