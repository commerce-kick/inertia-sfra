import Banner from "@/components/commerce/banner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TAccount } from "@/types/account";
import { usePage } from "@inertiajs/react";
import { Clock, Heart, ShoppingBag } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentCustomer: { profile },
  } = usePage<{ currentCustomer: { profile: TAccount } }>().props;

  // Get initials for avatar
  const getInitials = () => {
    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <div className="bg-gradient-to-b from-muted/50 to-background">
        <Banner title="My Account" />

        {/* Welcome Section */}
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <Avatar className="h-16 w-16 border-4 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {profile.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Manage your account details and preferences
              </p>
            </div>
            <div className="md:ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Clock className="h-4 w-4" />
                <span>Recently Viewed</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
// This layout is used for the account page. It centers the content both vertically and horizontally.
// It also adds padding and sets the minimum height of the screen to ensure that the content is always centered.
