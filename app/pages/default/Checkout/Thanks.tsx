import Banner from "@/components/commerce/banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUrl, Home_Show } from "@/generated/routes";
import Layout from "@/layouts/default";
import type { TOrder } from "@/types/checkout";
import { Link } from "@inertiajs/react";
import { format } from "date-fns";
import { Check } from "lucide-react";

const ThanksPage = ({ order }: { order: TOrder }) => {
  return (
    <>
      <Banner
        title="Thank You!"
        subtitle="Your order has been successfully placed. A confirmation email has been sent to fer@mail.com"
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="flex justify-center items-center">
          {/* Right Column - Order Details */}
          <Card className="w-full max-w-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order {order.orderNumber}</CardTitle>
                <CardDescription>
                  Placed on {format(order.creationDate, "PPpp")}
                </CardDescription>
              </div>
              <Button variant="outline">Download Receipt</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.items.map((item) => {
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                                    <Image
                                      src={item.images.small[0].absURL}
                                      alt={item.productName}
                                      width={64}
                                      height={64}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {item.productName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.variationAttributes.map((attr) => {
                                        return (
                                          <p>
                                            {attr.displayName}:{" "}
                                            {attr.displayValue}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.priceTotal.price}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2}>Subtotal</TableCell>
                          <TableCell className="text-right">
                            {order.totals.subTotal}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2}>Shipping</TableCell>
                          <TableCell className="text-right">
                            {order.totals.totalShippingCost}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2} className="font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {order.totals.grandTotal}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4 pt-4">
                  {/* <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Shipping Address</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>allende allende</p>
                            <p>asdaad</p>
                            <p>asdaad, SW42 4RG</p>
                            <p>01222 555 555</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Shipping Method</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Ground</p>
                            <p className="text-sm text-muted-foreground">
                              7-10 Business Days
                            </p>
                          </div>
                          <p className="font-medium">£5.99</p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 pt-4">
                  {/* <div className="space-y-2">
                    <h3 className="font-semibold">Billing Address</h3>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-2">
                        <Home className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p>allende allende</p>
                          <p>asdaad</p>
                          <p>asdaad, SW42 4RG</p>
                          <p>fer@mail.com</p>
                          <p>01222 555 555</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Payment Method</h3>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Credit Visa</p>
                          <p className="text-sm text-muted-foreground">
                            ************4242
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires 3/2030
                          </p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild>
                <Link href={getUrl(Home_Show)}>Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

//@ts-ignore
ThanksPage.layout = (page) => <Layout>{page}</Layout>;

export default ThanksPage;
