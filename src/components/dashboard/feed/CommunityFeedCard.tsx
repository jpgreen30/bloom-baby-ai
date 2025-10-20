import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface CommunityFeedCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    profiles: {
      display_name?: string;
      email: string;
      zip_code?: string;
    };
    babies?: {
      name: string;
      birthdate?: string;
      is_pregnancy: boolean;
      pregnancy_week?: number;
    };
    social_likes?: Array<{ user_id: string }>;
  };
}

export const CommunityFeedCard = ({ post }: CommunityFeedCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const displayName = post.profiles?.display_name || post.profiles?.email?.split('@')[0] || 'Anonymous';
  const babyInfo = post.babies?.is_pregnancy 
    ? `${post.babies.pregnancy_week} weeks pregnant`
    : post.babies?.birthdate 
      ? `Baby: ${post.babies.name}`
      : 'New parent';

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    if (liked) {
      await supabase
        .from('social_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);
      setLikesCount(prev => prev - 1);
      setLiked(false);
    } else {
      await supabase
        .from('social_likes')
        .insert({ post_id: post.id, user_id: user.id });
      setLikesCount(prev => prev + 1);
      setLiked(true);
    }
  };

  return (
    <Card className="feed-card w-full border-2 border-accent/30 rounded-none md:rounded-xl p-4 mb-0 md:mb-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {displayName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{displayName}</span>
            <Badge variant="secondary" className="text-xs">
              {babyInfo}
            </Badge>
            {post.profiles?.zip_code && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Nearby
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Image */}
      {post.image_url && (
        <div className="rounded-lg overflow-hidden mb-3 bg-muted">
          <img 
            src={post.image_url} 
            alt="Post" 
            className="w-full object-cover max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-2 ${liked ? 'text-destructive' : ''}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => window.location.href = '/community'}
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments_count}
        </Button>
      </div>
    </Card>
  );
};
