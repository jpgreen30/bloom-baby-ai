import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Users, Baby, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const SocialFeed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [userBaby, setUserBaby] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);

    const { data: baby } = await supabase
      .from("babies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setUserBaby(baby);

    await loadPosts();
    setLoading(false);
  };

  const loadPosts = async () => {
    const { data } = await supabase
      .from("social_posts")
      .select(`
        *,
        babies(name, birthdate, is_pregnancy, pregnancy_week),
        profiles(email),
        social_likes(user_id)
      `)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    const { error } = await supabase.from("social_posts").insert({
      user_id: user.id,
      baby_id: userBaby?.id,
      content: newPost,
    });

    if (error) {
      toast.error("Failed to create post");
      return;
    }

    setNewPost("");
    toast.success("Post created!");
    loadPosts();
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (isLiked) {
      await supabase
        .from("social_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("social_likes")
        .insert({ post_id: postId, user_id: user.id });
    }
    loadPosts();
  };

  const getStageLabel = (baby: any) => {
    if (!baby) return "Community";
    if (baby.is_pregnancy) {
      return `${baby.pregnancy_week || 0} weeks pregnant`;
    }
    const birthDate = new Date(baby.birthdate);
    const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${ageInMonths} months old`;
  };

  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    if (filter === "pregnancy") return post.babies?.is_pregnancy;
    if (filter === "newborn") {
      if (!post.babies) return false;
      const ageInMonths = Math.floor((Date.now() - new Date(post.babies.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      return ageInMonths <= 3;
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
            <h1 className="text-2xl font-bold">Mom Community</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts, questions, or milestones..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {userBaby && getStageLabel(userBaby)}
                </span>
                <Button onClick={createPost} disabled={!newPost.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pregnancy">Pregnancy</TabsTrigger>
            <TabsTrigger value="newborn">Newborn (0-3mo)</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-6">
            {filteredPosts.map(post => {
              const isLiked = post.social_likes?.some((like: any) => like.user_id === user.id);
              
              return (
                <Card key={post.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Baby className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {post.babies?.name || "Anonymous Mom"}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {getStageLabel(post.babies)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap">{post.content}</p>

                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id, isLiked)}
                        className={isLiked ? "text-red-500" : ""}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                        {post.likes_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
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
                <p className="text-muted-foreground">Be the first to share something!</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SocialFeed;
