"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ShoppingBag, CreditCard, Truck, Check } from "lucide-react";

import type { CheckoutResponse } from "@/types/response/checkout";
import CustomerForm from "@/components/commerce/checkout/customer-form";
import ShippingForm from "@/components/commerce/checkout/shipping-form";
import PaymentForm from "@/components/commerce/checkout/payment-form";
import OrderSummary from "@/components/commerce/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { router } from "@inertiajs/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getUrl, Order_Confirm } from "@/generated/routes";

export default function CheckoutPage(checkoutData: CheckoutResponse) {
  const [activeTab, setActiveTab] = useQueryState("stage", {
    defaultValue: "customer",
  });

  // Update the active tab when the current stage changes from backend
  useEffect(() => {
    if (checkoutData.currentStage && checkoutData.currentStage !== activeTab) {
      setActiveTab(checkoutData.currentStage);
    }
  }, [checkoutData.currentStage, activeTab, setActiveTab]);

  // Handle place order submission
  const placeOrder = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        "/on/demandware.store/Sites-RefArch-Site/en_US/CheckoutServices-PlaceOrder",
        {
          csrf_token: checkoutData.csrf?.token || "",
        }
      );
      return data;
    },
    onSuccess: (data) => {
      // Redirect to order confirmation page
      router.post(
        getUrl(Order_Confirm),
        {
          orderID: data.orderID,
          orderToken: data.orderToken,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    },
    onError: (error) => {
      console.error("Error placing order:", error);
    },
  });

  // Determine if each stage is completed
  const isCustomerCompleted = !!checkoutData.order?.orderEmail;
  const isShippingCompleted =
    checkoutData.order?.shipping?.[0]?.selectedShippingMethod?.ID;
  const isPaymentCompleted = checkoutData.currentStage === "placeOrder";

  console.log(checkoutData);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab || "customer"}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="customer" className="relative">
                <ShoppingBag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Customer</span>
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="relative"
                disabled={!isCustomerCompleted}
              >
                <Truck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Shipping</span>
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="relative"
                disabled={!isShippingCompleted}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>

              <TabsTrigger
                value="placeOrder"
                disabled={checkoutData.currentStage !== "placeOrder"}
                className="relative"
              >
                <Check className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Place Order</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <Card>
                {checkoutData.customer.registeredUser ||
                checkoutData.order.orderEmail ? (
                  <>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                      <CardDescription>
                        {checkoutData.customer.registeredUser
                          ? `Welcome back, ${checkoutData.customer.profile.firstName} ${checkoutData.customer.profile.lastName}`
                          : checkoutData.order?.orderEmail}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Email:</strong>{" "}
                          {checkoutData.order?.orderEmail}
                        </p>
                        {checkoutData.customer.registeredUser && (
                          <p>
                            <strong>Account:</strong> Registered Customer
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setActiveTab("shipping");
                        }}
                      >
                        Continue to Shipping
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                      <CardDescription>
                        Enter your email to continue with your purchase
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CustomerForm
                        token={checkoutData.csrf?.token || ""}
                        onSubmit={() => {
                          setActiveTab("shipping");
                        }}
                        initialEmail={checkoutData.order?.orderEmail || ""}
                      />
                    </CardContent>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </CardHeader>
                <CardContent>
                  <ShippingForm
                    token={checkoutData.csrf?.token || ""}
                    onSubmit={() => {
                      setActiveTab("payment");
                    }}
                    customer={checkoutData.customer}
                    shipping={checkoutData.order?.shipping}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>
                    Complete your purchase securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentForm
                    token={checkoutData.csrf?.token || ""}
                    customer={checkoutData.customer}
                    billing={checkoutData.order?.billing}
                    expirationYears={checkoutData.expirationYears || []}
                    onSubmit={() => {
                      setActiveTab("placeOrder");
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="placeOrder">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>
                    Please review your order details before placing your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Customer Information Summary */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        Customer Information
                      </h3>
                      <p>{checkoutData.order.orderEmail}</p>
                    </div>

                    {/* Shipping Information Summary */}
                    {checkoutData.order?.shipping?.[0].shippingAddress && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                          Shipping Information
                        </h3>
                        <div className="flex justify-between">
                          <div>
                            <p>
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  ?.firstName
                              }{" "}
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  .lastName
                              }
                            </p>
                            <p>
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  .address1
                              }
                            </p>
                            {checkoutData.order.shipping[0].shippingAddress
                              .address2 && (
                              <p>
                                {
                                  checkoutData.order.shipping[0].shippingAddress
                                    .address2
                                }
                              </p>
                            )}
                            <p>
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  .city
                              }
                              ,{" "}
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  .postalCode
                              }
                            </p>
                            <p>
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  .countryCode.displayValue
                              }
                            </p>
                            <p>
                              {
                                checkoutData.order.shipping[0].shippingAddress
                                  .phone
                              }
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">
                              {
                                checkoutData.order.shipping[0]
                                  .selectedShippingMethod.displayName
                              }
                            </p>
                            <p>
                              {
                                checkoutData.order.shipping[0]
                                  .selectedShippingMethod.description
                              }
                            </p>
                            <p>
                              {
                                checkoutData.order.shipping[0]
                                  .selectedShippingMethod.shippingCost
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Billing Information Summary */}
                    {checkoutData.order?.billing && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                          Payment Information
                        </h3>
                        <div className="flex justify-between">
                          <div>
                            {checkoutData.order.billing.billingAddress
                              .address && (
                              <>
                                <p>
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.firstName
                                  }{" "}
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.lastName
                                  }
                                </p>
                                <p>
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.address1
                                  }
                                </p>
                                {checkoutData.order.billing.billingAddress
                                  .address.address2 && (
                                  <p>
                                    {
                                      checkoutData.order.billing.billingAddress
                                        .address.address2
                                    }
                                  </p>
                                )}
                                <p>
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.city
                                  }
                                  ,{" "}
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.postalCode
                                  }
                                </p>
                                <p>
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.countryCode.displayValue
                                  }
                                </p>
                                <p>
                                  {
                                    checkoutData.order.billing.billingAddress
                                      .address.phone
                                  }
                                </p>
                              </>
                            )}
                          </div>
                          <div>
                            {checkoutData.order.billing.payment.selectedPaymentInstruments?.map(
                              (payment, index) => (
                                <div key={index}>
                                  <p className="font-medium">
                                    {payment.paymentMethod}
                                  </p>
                                  {payment.paymentMethod === "CREDIT_CARD" && (
                                    <p>
                                      {payment.type} ending in{" "}
                                      {payment.maskedCreditCardNumber}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full mt-6"
                      onClick={() => placeOrder.mutate()}
                      disabled={placeOrder.isPending}
                    >
                      {placeOrder.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {checkoutData.order?.items.totalQuantity}{" "}
                {checkoutData.order?.items.totalQuantity === 1
                  ? "item"
                  : "items"}{" "}
                in your cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderSummary order={checkoutData.order!} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
