import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, Gamepad2, ShoppingBag, MoreHorizontal } from "lucide-react";

interface CategoryTabsProps {
  children: (category: string) => React.ReactNode;
}

export const CategoryTabs = ({ children }: CategoryTabsProps) => {
  const categories = [
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "gaming", label: "Gaming", icon: Gamepad2 },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "other", label: "Other", icon: MoreHorizontal },
  ];

  return (
    <Tabs defaultValue="payments" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="flex items-center gap-2"
          >
            <cat.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{cat.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id} className="space-y-6">
          {children(cat.id)}
        </TabsContent>
      ))}
    </Tabs>
  );
};
