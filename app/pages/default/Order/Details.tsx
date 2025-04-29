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
import Layout from "@/layouts/default";
import type { TOrder } from "@/types/checkout";
import { format } from "date-fns";
import { Check } from "lucide-react";

const OrderDetails = ({ order }: { order: TOrder }) => {
  return (
    <>
      <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 py-10 text-center md:py-16">
          <div className="rounded-full bg-primary-foreground/20 p-3">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Thank You!
          </h1>
          <p className="max-w-[600px] text-lg text-primary-foreground/80">
            Your order has been successfully placed. A confirmation email has
            been sent to {order.orderEmail}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Right Column - Order Details */}
          <Card className="md:col-span-1 lg:col-span-2">
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
                                      {/*  {item.variationAttributes.map((attr) => {
                                        return (
                                          <p>
                                            {attr.displayName}:{" "}
                                            {attr.displayValue}
                                          </p>
                                        );
                                      })} */}
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

                <TabsContent
                  value="shipping"
                  className="space-y-4 pt-4"
                ></TabsContent>

                <TabsContent
                  value="payment"
                  className="space-y-4 pt-4"
                ></TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Track Order</Button>
              <Button>Continue Shopping</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

//@ts-ignore
OrderDetails.layout = (page) => <Layout>{page}</Layout>;

export default OrderDetails;
