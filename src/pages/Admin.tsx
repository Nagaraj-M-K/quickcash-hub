import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";
import { AddAppForm } from "@/components/admin/AddAppForm";
import { AddBlogForm } from "@/components/admin/AddBlogForm";
import { ManageApps } from "@/components/admin/ManageApps";
import { ManageBlogs } from "@/components/admin/ManageBlogs";
import { ManageClicks } from "@/components/admin/ManageClicks";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const { isAdmin, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      <BottomNav />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-center bg-gradient-primary bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        
        <Tabs defaultValue="clicks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6 gap-1">
            <TabsTrigger value="clicks" className="text-xs md:text-sm">Track Clicks</TabsTrigger>
            <TabsTrigger value="apps" className="text-xs md:text-sm">Add App</TabsTrigger>
            <TabsTrigger value="blogs" className="text-xs md:text-sm">Add Blog</TabsTrigger>
            <TabsTrigger value="manage-apps" className="text-xs md:text-sm">Manage Apps</TabsTrigger>
            <TabsTrigger value="manage-blogs" className="text-xs md:text-sm">Manage Blogs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clicks">
            <ManageClicks />
          </TabsContent>
          
          <TabsContent value="apps">
            <AddAppForm />
          </TabsContent>
          
          <TabsContent value="blogs">
            <AddBlogForm />
          </TabsContent>
          
          <TabsContent value="manage-apps">
            <ManageApps />
          </TabsContent>
          
          <TabsContent value="manage-blogs">
            <ManageBlogs />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
