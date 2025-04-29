import {
  User,
  CreditCard,
  Lock,
  MapPin,
  Edit,
  Plus,
  Eye,
  Phone,
  Mail,
  ChevronRight,
  ShoppingBag, Heart,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/layouts/default";
import type { TAccount } from "@/types/account";
import { OrderCard } from "@/components/commerce/order-card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { TOrder } from "@/types/order";
import type { WishListShowResponse } from "@/types/wishlist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrderCardSkeleton } from "@/components/commerce/order-card-skeleton";
import { WishlistItemSkeleton } from "@/components/commerce/wishlist-item-skeleton";
import { WishlistItem } from "@/components/commerce/wishlist-item";
import AccountLayout from "@/layouts/account";
import { Link } from "@inertiajs/react";
import {
  Account_EditProfile,
  Address_AddAddress,
  Address_EditAddress,
  createRouteHelpers,
  PaymentInstruments_AddPayment,
  PaymentInstruments_List,
} from "@/generated/routes";

const OrderHistory = () => {
  const { data, isLoading, error } = useQuery<{ orders: TOrder[] }>({
    queryKey: ["orderHistory"],
    queryFn: async () => {
      const { data } = await axios.get("Order-History");
      return data;
    },
    staleTime: 0,
  });

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem loading your order history. Please try again
          later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    );
  }

  if (!data || data.orders.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No orders yet</h3>
          <p className="text-muted-foreground mt-1 max-w-md">
            When you place orders, they will appear here for you to track and
            review
          </p>
          <Button className="mt-4 gap-1">
            <ShoppingBag className="h-4 w-4" />
            <span>Start Shopping</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.orders.map((order) => {
        return (
          <OrderCard
            key={order.orderNumber}
            order={order}
            resources={order.resources}
          />
        );
      })}
    </div>
  );
};

const Wishlist = () => {
  const { data, isLoading, error } = useQuery<WishListShowResponse>({
    queryKey: ["Wishlist"],
    queryFn: async () => {
      const { data } = await axios.get("Wishlist-Show");
      return data;
    },
    staleTime: 0,
  });

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem loading your wishlist. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WishlistItemSkeleton />
        <WishlistItemSkeleton />
      </div>
    );
  }

  if (!data || data.wishlist.items.length === 0) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Your wishlist is empty</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          Save items you love to your wishlist and they'll appear here
        </p>
        <Button className="mt-4 gap-1">
          <ShoppingBag className="h-4 w-4" />
          <span>Browse Products</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.wishlist.items.map((item) => (
        <WishlistItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const Dashboard = ({ account, ...rest }: { account: TAccount }) => {
  const { data: orderHistoryData, isLoading: orderHistoryLoading } = useQuery<{
    orders: TOrder[];
  }>({
    queryKey: ["orderHistory"],
    queryFn: async () => {
      const { data } = await axios.get("Order-History");
      return data;
    },
    staleTime: 0,
    enabled: false, // Only load when tab is active
  });

  const routes = createRouteHelpers({
    "Address-EditAddress": Address_EditAddress,
    "PaymentInstruments-AddPayment": PaymentInstruments_AddPayment,
    "Account-EditProfile": Account_EditProfile,
    "Address-AddAddress": Address_AddAddress,
    "PaymentInstruments-List": PaymentInstruments_List,
  });

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="account" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Section */}
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1 h-8"
                  >
                    <Edit className="h-4 w-4" />
                    <Link href={routes.url("Account-EditProfile")}>Edit</Link>
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        First Name
                      </div>
                      <div className="font-medium">
                        {account.profile.firstName}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Last Name
                      </div>
                      <div className="font-medium">
                        {account.profile.lastName}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </div>
                    <div className="font-medium">{account.profile.email}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Phone</span>
                    </div>
                    <div className="font-medium">{account.profile.phone}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Payment Methods</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1 h-8"
                    asChild
                  >
                    <Link href={routes.url("PaymentInstruments-List")}>
                      <Edit className="h-4 w-4" />
                      <span>View All</span>
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="min-h-[180px] flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No payment methods added</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a payment method to make checkout faster
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <Button className="gap-2" asChild>
                    <Link href={routes.url("PaymentInstruments-AddPayment")}>
                      <Plus className="h-4 w-4" />
                      <span>Add Payment Method</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Password Section */}
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Security</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1 h-8"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Change</span>
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Password
                      </div>
                      <div className="font-medium flex items-center">
                        ••••••••
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Book Section */}
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle>Address Book</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1 h-8"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View All</span>
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  {account.preferredAddress && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          Default Shipping Address
                        </div>
                        <Badge>Default</Badge>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg border text-sm space-y-1">
                        <p className="font-medium">
                          {account.profile.firstName} {account.profile.lastName}
                        </p>
                        <p>{account.preferredAddress.address.address1}</p>

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>4322211221</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  {account.preferredAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      asChild
                    >
                      <Link
                        href={routes.url("Address-EditAddress", {
                          addressId: account.preferredAddress.address.ID,
                        })}
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </Button>
                  )}
                  <Button className="gap-1" asChild>
                    <Link href={routes.url("Address-AddAddress")}>
                      <Plus className="h-4 w-4" />
                      <span>Add New Address</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Orders Preview */}
              <Card className="md:col-span-2 border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <CardTitle>Recent Orders</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1 h-8"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View All</span>
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  {orderHistoryLoading ? (
                    <div className="space-y-6">
                      <OrderCardSkeleton />
                    </div>
                  ) : account.orderHistory ? (
                    <div className="space-y-6">
                      <OrderCard
                        order={account.orderHistory}
                        resources={account.orderHistory.resources}
                      />
                    </div>
                  ) : (
                    <div className="min-h-[100px] flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">No orders yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          When you place orders, they will appear here for you
                          to track and review
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <Button variant="outline" className="gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Continue Shopping</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and manage your previous orders
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <OrderHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>
                  Products you've saved for later
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Wishlist />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

//@ts-ignore
Dashboard.layout = (page) => (
  <Layout>
    <AccountLayout>{page}</AccountLayout>
  </Layout>
);

export default Dashboard;
