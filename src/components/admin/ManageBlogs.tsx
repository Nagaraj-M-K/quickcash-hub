import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Blog {
  id: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
}

export const ManageBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Blog post deleted successfully");
      fetchBlogs();
    } catch (error: any) {
      toast.error("Failed to delete blog post");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ published: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(`Blog post ${!currentStatus ? 'published' : 'unpublished'}`);
      fetchBlogs();
    } catch (error: any) {
      toast.error("Failed to update blog post");
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
        <CardTitle>Manage Blog Posts</CardTitle>
        <CardDescription>View, publish/unpublish, and delete blog posts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No blog posts found</p>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog.id}
                className="flex flex-col p-4 border rounded-lg gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{blog.title}</h3>
                    <Badge variant={blog.published ? "default" : "secondary"}>
                      {blog.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {blog.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2">{blog.excerpt}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(blog.id, blog.published)}
                  >
                    {blog.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(blog.id)}
                    disabled={deleting === blog.id}
                  >
                    {deleting === blog.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
