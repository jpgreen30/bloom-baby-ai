import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageCircle, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [baby, setBaby] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('social-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUser(user);

    const { data: babyData } = await supabase
      .from("babies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    setBaby(babyData);
    await loadPosts();
    setLoading(false);
  };

  const loadPosts = async () => {
    const { data: postsData } = await supabase
      .from("social_posts")
      .select(`
        *,
        babies(name, birthdate, is_pregnancy, pregnancy_week),
        social_likes(user_id),
        social_comments(count)
      `)
      .order("created_at", { ascending: false });

    setPosts(postsData || []);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from("social_posts").insert({
        user_id: user.id,
        baby_id: baby?.id,
        content: newPost,
      });

      if (error) throw error;
      
      setNewPost("");
      toast.success("Posted successfully!");
      loadPosts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (isLiked) {
      await supabase.from("social_likes").delete().match({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from("social_likes").insert({ post_id: postId, user_id: user.id });
    }
    loadPosts();
  };

  const getStageLabel = (post: any) => {
    const babyData = post.babies;
    if (!babyData) return "New Parent";
    
    if (babyData.is_pregnancy) {
      return `${babyData.pregnancy_week} weeks pregnant`;
    }
    
    const birthDate = new Date(babyData.birthdate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(ageInDays / 30);
    
    if (months < 12) return `${months} months`;
    return `${Math.floor(months / 12)} years`;
  };

  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    if (filter === "pregnancy") return post.babies?.is_pregnancy;
    if (filter === "newborn") {
      if (!post.babies?.birthdate) return false;
      const ageInMonths = Math.floor((Date.now() - new Date(post.babies.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      return ageInMonths <= 3;
    }
    if (filter === "infant") {
      if (!post.babies?.birthdate) return false;
      const ageInMonths = Math.floor((Date.now() - new Date(post.babies.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      return ageInMonths > 3 && ageInMonths <= 12;
    }
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Community</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your journey with other moms..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handlePost} disabled={submitting || !newPost.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge 
            variant={filter === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge 
            variant={filter === "pregnancy" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("pregnancy")}
          >
            Pregnancy
          </Badge>
          <Badge 
            variant={filter === "newborn" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("newborn")}
          >
            Newborn (0-3mo)
          </Badge>
          <Badge 
            variant={filter === "infant" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("infant")}
          >
            Infant (3-12mo)
          </Badge>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isLiked = post.social_likes?.some((like: any) => like.user_id === user.id);
            
            return (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {post.babies?.name?.[0] || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{post.babies?.name || "Anonymous Mom"}</p>
                          <Badge variant="secondary" className="text-xs">
                            {getStageLabel(post)}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap mb-4">{post.content}</p>
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="rounded-lg w-full mb-4"
                    />
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, isLiked)}
                      className={isLiked ? "text-red-500" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                      {post.likes_count || 0}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments_count || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredPosts.length === 0 && (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Be the first to share your journey!</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Community;
