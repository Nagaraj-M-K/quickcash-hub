import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const appSchema = z.object({
  name: z.string().trim().min(1, "App name is required").max(100, "App name must be less than 100 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  category: z.enum(["payments", "gaming", "shopping", "other"], { errorMap: () => ({ message: "Please select a valid category" }) }),
  bonusAmount: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num <= 100000;
  }, "Bonus amount must be between 1 and 100,000"),
  payoutTime: z.string().trim().min(1, "Payout time is required").max(100, "Payout time must be less than 100 characters"),
  commissionRate: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 1;
  }, "Commission rate must be between 0 and 1 (0-100%)"),
  sortOrder: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, "Sort order must be a non-negative number"),
  taskDescription: z.string().trim().min(5, "Task description must be at least 5 characters").max(500, "Task description must be less than 500 characters"),
  referralLink: z.string().url("Please enter a valid URL").max(500, "URL must be less than 500 characters"),
  imageUrl: z.string().refine((val) => val === "" || z.string().url().safeParse(val).success, "Please enter a valid URL or leave empty").optional(),
});

export const AddAppForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "payments",
    bonusAmount: "",
    payoutTime: "",
    taskDescription: "",
    referralLink: "",
    imageUrl: "",
    isFeatured: false,
    commissionRate: "0.30",
    sortOrder: "0"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validated = appSchema.parse(formData);

      const { error } = await supabase.from("apps").insert([{
        name: validated.name,
        description: validated.description,
        category: validated.category,
        bonus_amount: parseInt(validated.bonusAmount),
        payout_time: validated.payoutTime,
        task_description: validated.taskDescription,
        referral_link: validated.referralLink,
        image_url: validated.imageUrl || null,
        is_featured: formData.isFeatured,
        commission_rate: parseFloat(validated.commissionRate),
        sort_order: parseInt(validated.sortOrder)
      }]);

      if (error) throw error;

      toast.success("App added successfully!");
      setFormData({
        name: "",
        description: "",
        category: "payments",
        bonusAmount: "",
        payoutTime: "",
        taskDescription: "",
        referralLink: "",
        imageUrl: "",
        isFeatured: false,
        commissionRate: "0.30",
        sortOrder: "0"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
      toast.error(error.message || "Failed to add app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New App</CardTitle>
        <CardDescription>Add a new app to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="PayPal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonusAmount">Bonus Amount ($) *</Label>
              <Input
                id="bonusAmount"
                type="number"
                required
                value={formData.bonusAmount}
                onChange={(e) => setFormData({ ...formData, bonusAmount: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutTime">Payout Time *</Label>
              <Input
                id="payoutTime"
                required
                value={formData.payoutTime}
                onChange={(e) => setFormData({ ...formData, payoutTime: e.target.value })}
                placeholder="24 hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (0-1) *</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                required
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                placeholder="0.30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order *</Label>
              <Input
                id="sortOrder"
                type="number"
                required
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Sign up and get instant bonus"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskDescription">Task Description *</Label>
            <Textarea
              id="taskDescription"
              required
              value={formData.taskDescription}
              onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
              placeholder="Sign up and complete verification"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralLink">Referral Link *</Label>
            <Input
              id="referralLink"
              type="url"
              required
              value={formData.referralLink}
              onChange={(e) => setFormData({ ...formData, referralLink: e.target.value })}
              placeholder="https://example.com/ref"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
            />
            <Label htmlFor="isFeatured">Featured App</Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add App"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
