import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DynamicHeroBanner } from "@/components/dashboard/DynamicHeroBanner";
import { BloomingFlowerLoader } from "@/components/dashboard/BloomingFlowerLoader";
import { MilestoneUnlockCard } from "@/components/dashboard/feed/MilestoneUnlockCard";
import { ProductCarouselCard } from "@/components/dashboard/feed/ProductCarouselCard";
import { CommunityFeedCard } from "@/components/dashboard/feed/CommunityFeedCard";
import { TipNuggetCard } from "@/components/dashboard/feed/TipNuggetCard";
import { PregnancyDashboard } from "@/components/dashboard/pregnancy/PregnancyDashboard";
import ProductRecommendations from "@/components/ProductRecommendations";

interface FeedItem {
  id: string;
  type: 'milestone' | 'product' | 'community' | 'tip';
  data: any;
  timestamp: Date;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [baby, setBaby] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState("");
  const observerTarget = useRef(null);

  // Load baby data and AI summary
  useEffect(() => {
    loadBabyData();
  }, []);

  // Initial feed load
  useEffect(() => {
    if (baby) {
      loadMoreFeedItems();
    }
  }, [baby]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreFeedItems();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  const loadBabyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: babyData } = await supabase
      .from("babies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!babyData) {
      navigate("/onboarding");
      return;
    }

    setBaby(babyData);
    loadAISummary(babyData);
  };

  const loadAISummary = async (babyData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-dashboard-summary', {
        body: { baby_id: babyData.id, date_range_days: 7 }
      });

      if (error) throw error;
      setAiSummary(data.summary);
    } catch (error) {
      console.error('AI summary error:', error);
      setAiSummary(`Welcome back! Let's track ${babyData.name}'s journey.`);
    }
  };

  const loadMoreFeedItems = async () => {
    if (loading || !hasMore || !baby) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      
      // Fetch data in parallel
      const [milestones, products, posts, tips] = await Promise.all([
        fetchMilestones(nextPage, 3),
        fetchProducts(nextPage, 15),
        fetchCommunityPosts(nextPage, 3),
        fetchTips(nextPage, 3),
      ]);

      const mixed = mixFeedItems(milestones, products, posts, tips);
      
      setFeedItems(prev => [...prev, ...mixed]);
      setPage(nextPage);
      setHasMore(mixed.length > 0);
    } catch (error) {
      console.error('Feed load error:', error);
      toast.error('Failed to load more items');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (page: number, limit: number) => {
    const { data } = await supabase
      .from('baby_milestones')
      .select('*, milestone:milestones(*)')
      .eq('baby_id', baby.id)
      .in('status', ['achieved', 'in_progress'])
      .order('achieved_at', { ascending: false, nullsFirst: false })
      .range((page - 1) * limit, page * limit - 1);

    return data || [];
  };

  const fetchProducts = async (page: number, limit: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('product_recommendations')
      .select('*, listing:marketplace_listings(*, marketplace_images(*))')
      .eq('user_id', user.id)
      .eq('clicked', false)
      .order('relevance_score', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    return data || [];
  };

  const fetchCommunityPosts = async (page: number, limit: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('zip_code')
      .eq('id', user.id)
      .single();

    const userZipPrefix = userProfile?.zip_code?.substring(0, 3);

    const { data } = await supabase
      .from('social_posts')
      .select(`
        *,
        babies(name, birthdate, is_pregnancy, pregnancy_week)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (!data) return [];

    // Fetch profile data separately for each post
    const postsWithProfiles = await Promise.all(
      data.map(async (post) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email, zip_code')
          .eq('id', post.user_id)
          .single();

        return {
          ...post,
          profiles: profile,
        };
      })
    );

    // Filter by geo
    const filtered = userZipPrefix 
      ? postsWithProfiles.filter(post => post.profiles?.zip_code?.startsWith(userZipPrefix))
      : postsWithProfiles;

    return filtered || [];
  };

  const fetchTips = async (page: number, limit: number) => {
    const ageInWeeks = baby.is_pregnancy 
      ? baby.pregnancy_week 
      : Math.floor((Date.now() - new Date(baby.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 7));

    const { data } = await supabase
      .from('parenting_tips')
      .select('*')
      .lte('min_age_weeks', ageInWeeks)
      .gte('max_age_weeks', ageInWeeks)
      .order('priority', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    return data || [];
  };

  const mixFeedItems = (milestones: any[], products: any[], posts: any[], tips: any[]): FeedItem[] => {
    const mixed: FeedItem[] = [];
    const pattern = ['milestone', 'product', 'community', 'tip'];

    for (let i = 0; i < 10; i++) {
      const type = pattern[i % pattern.length];

      switch (type) {
        case 'milestone':
          if (milestones.length > 0) {
            const milestone = milestones.shift();
            mixed.push({
              type: 'milestone',
              data: milestone,
              id: `milestone-${milestone.id}`,
              timestamp: new Date(),
            });
          }
          break;
        case 'product':
          const productBatch = products.splice(0, 5);
          if (productBatch.length > 0) {
            mixed.push({
              type: 'product',
              data: productBatch,
              id: `product-${mixed.length}`,
              timestamp: new Date(),
            });
          }
          break;
        case 'community':
          if (posts.length > 0) {
            const post = posts.shift();
            mixed.push({
              type: 'community',
              data: post,
              id: `post-${post.id}`,
              timestamp: new Date(),
            });
          }
          break;
        case 'tip':
          if (tips.length > 0) {
            const tip = tips.shift();
            mixed.push({
              type: 'tip',
              data: tip,
              id: `tip-${tip.id}`,
              timestamp: new Date(),
            });
          }
          break;
      }
    }

    return mixed;
  };

  const handleMilestoneStatusChange = async (milestoneId: string, status: string) => {
    try {
      const achieved_at = status === 'achieved' ? new Date().toISOString() : null;

      await supabase
        .from('baby_milestones')
        .update({ status, achieved_at })
        .eq('id', milestoneId);

      // Update local state
      setFeedItems(prev => prev.map(item => {
        if (item.type === 'milestone' && item.data.id === milestoneId) {
          return {
            ...item,
            data: {
              ...item.data,
              status,
              achieved_at,
            },
          };
        }
        return item;
      }));

      toast.success('Milestone updated!');
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const renderFeedCard = (item: FeedItem) => {
    switch (item.type) {
      case 'milestone':
        return (
          <MilestoneUnlockCard 
            key={item.id} 
            data={item.data} 
            onStatusChange={handleMilestoneStatusChange}
          />
        );
      case 'product':
        return <ProductCarouselCard key={item.id} products={item.data} />;
      case 'community':
        return <CommunityFeedCard key={item.id} post={item.data} />;
      case 'tip':
        return <TipNuggetCard key={item.id} tip={item.data} />;
      default:
        return null;
    }
  };

  // Check if pregnancy mode
  const isPregnancy = baby?.is_pregnancy === true;

  // If pregnancy mode, show pregnancy dashboard
  if (isPregnancy) {
    return <PregnancyDashboard baby={baby} aiSummary={aiSummary} />;
  }

  // Otherwise show normal feed
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Banner */}
      <DynamicHeroBanner
        babyName={baby?.name}
        aiSummary={aiSummary}
        onClaimFreebie={() => navigate('/premium')}
      />

      {/* Smart Product Recommendations */}
      {baby && (
        <div className="w-full max-w-2xl mx-auto px-4 mb-8">
          <ProductRecommendations 
            babyId={baby.id}
            babyAge={baby.birthdate ? Math.floor((new Date().getTime() - new Date(baby.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 7)) : undefined}
            babyName={baby.name}
            isPregnancy={baby.is_pregnancy}
            pregnancyWeek={baby.pregnancy_week}
          />
        </div>
      )}

      {/* Infinite Feed */}
      <div className="w-full max-w-2xl mx-auto px-0 md:px-4">
        {feedItems.map(item => renderFeedCard(item))}

        {/* Loader */}
        <div ref={observerTarget} className="w-full">
          {loading && <BloomingFlowerLoader />}
          {!hasMore && feedItems.length > 0 && (
            <p className="text-center text-muted-foreground py-8">
              You're all caught up! 🎉
            </p>
          )}
          {!loading && feedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No items to display yet. Check back soon!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
