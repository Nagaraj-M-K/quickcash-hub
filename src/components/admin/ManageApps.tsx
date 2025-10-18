import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface App {
  id: string;
  name: string;
  category: string;
  bonus_amount: number;
  is_featured: boolean;
  referral_link: string;
}

export const ManageApps = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setApps(data || []);
    } catch (error: any) {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this app?")) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase.from("apps").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("App deleted successfully");
      fetchApps();
    } catch (error: any) {
      toast.error("Failed to delete app");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Apps</CardTitle>
        <CardDescription>View and delete existing apps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No apps found</p>
          ) : (
            apps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{app.name}</h3>
                    {app.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    <Badge variant="outline">{app.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bonus: ${app.bonus_amount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    {app.referral_link}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(app.id)}
                  disabled={deleting === app.id}
                >
                  {deleting === app.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
