import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { AddAppForm } from "@/components/admin/AddAppForm";
import { AddBlogForm } from "@/components/admin/AddBlogForm";
import { ManageApps } from "@/components/admin/ManageApps";
import { ManageBlogs } from "@/components/admin/ManageBlogs";
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-center">
          Admin Dashboard
        </h1>
        
        <Tabs defaultValue="apps" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="apps">Add App</TabsTrigger>
            <TabsTrigger value="blogs">Add Blog</TabsTrigger>
            <TabsTrigger value="manage-apps">Manage Apps</TabsTrigger>
            <TabsTrigger value="manage-blogs">Manage Blogs</TabsTrigger>
          </TabsList>
          
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
