import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Search, Heart, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data: listingsData } = await supabase
      .from("marketplace_listings")
      .select(`
        *,
        marketplace_images(image_url, is_primary)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setListings(listingsData || []);
    setLoading(false);
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrimaryImage = (listing: any) => {
    const primaryImage = listing.marketplace_images?.find((img: any) => img.is_primary);
    return primaryImage?.image_url || listing.marketplace_images?.[0]?.image_url || "/placeholder.svg";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Baby Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">Buy and sell gently used baby items</p>
        </div>
        {user && (
          <Button onClick={() => navigate("/marketplace/sell")}>
            <Plus className="w-4 h-4 mr-2" />
            Sell Item
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search for baby items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <Card 
              key={listing.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img 
                  src={getPrimaryImage(listing)}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
                  {listing.condition}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    toast.info("Favorites coming soon!");
                  }}>
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">${listing.price}</span>
                    {listing.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${listing.original_price}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {listing.location_city}, {listing.location_state}
                  </div>
                  <Badge variant="secondary">{listing.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or be the first to list an item!</p>
          </Card>
        )}
    </div>
  );
};

export default Marketplace;
