import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/AppCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search } from "lucide-react";

export default function Categories() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAllApps();
  }, []);

  const loadAllApps = async () => {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("category")
      .order("sort_order");

    if (error) {
      console.error("Error loading apps:", error);
    } else {
      setApps(data || []);
    }
  };

  const filterAppsByCategory = (category: string) => {
    return apps.filter(
      (app) =>
        app.category === category &&
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold">Browse All Apps</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search across all categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs>
          {(category) => {
            const categoryApps = filterAppsByCategory(category);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryApps.length > 0 ? (
                  categoryApps.map((app) => <AppCard key={app.id} {...app} />)
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-12">
                    No apps found in this category
                  </p>
                )}
              </div>
            );
          }}
        </CategoryTabs>
      </div>
    </div>
  );
}
