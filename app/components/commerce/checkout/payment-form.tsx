"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Wallet, Check, Pencil, Loader2 } from "lucide-react";
import type {
  Billing,
  CheckoutResponse,
  Address,
} from "@/types/response/checkout";
import { router } from "@inertiajs/react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const paymentSchema = z.object({
  dwfrm_billing_paymentMethod: z
    .string()
    .min(1, { message: "Please select a payment method" }),
  dwfrm_billing_shippingAddressUseAsBillingAddress: z.boolean().default(true),
  // Credit card fields
  dwfrm_billing_creditCardFields_cardType: z.string().optional(),
  dwfrm_billing_creditCardFields_cardNumber: z.string().optional(),
  dwfrm_billing_creditCardFields_cardOwner: z.string().optional(),
  dwfrm_billing_creditCardFields_expirationMonth: z.string().optional(),
  dwfrm_billing_creditCardFields_expirationYear: z.string().optional(),
  dwfrm_billing_creditCardFields_securityCode: z.string().optional(),
  dwfrm_billing_creditCardFields_saveCard: z.boolean().default(false),
  // Billing address fields (only used if sameAsShipping is false)
  dwfrm_billing_addressFields_firstName: z.string().optional(),
  dwfrm_billing_addressFields_lastName: z.string().optional(),
  dwfrm_billing_addressFields_address1: z.string().optional(),
  dwfrm_billing_addressFields_address2: z.string().nullable(),
  dwfrm_billing_addressFields_country: z.string().optional(),
  dwfrm_billing_addressFields_city: z.string().optional(),
  dwfrm_billing_addressFields_postalCode: z.string().optional(),
  dwfrm_billing_contactInfoFields_phone: z.string().optional(),
  // Saved payment method
  savedPaymentMethodUUID: z.string().optional(),
  securityCode: z.string().optional(),
});

type PaymentFormProps = {
  token: string;
  customer?: CheckoutResponse["customer"];
  billing?: Billing;
  expirationYears?: number[];
  onSubmit: () => void;
};

export default function PaymentForm({
  token,
  customer,
  billing,
  expirationYears = [],
  onSubmit,
}: PaymentFormProps) {
  const [showBillingAddress, setShowBillingAddress] = useState(false);
  const [showSavedCards, setShowSavedCards] = useState(
    customer?.customerPaymentInstruments &&
      customer.customerPaymentInstruments.length > 0
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  const savedPaymentMethods = customer?.customerPaymentInstruments || [];
  const paymentMethods = billing?.payment.applicablePaymentMethods || [];
  const paymentCards = billing?.payment.applicablePaymentCards || [];

  // Get shipping address to use as default for billing if needed
  const shippingAddress =
    customer?.addresses?.find(
      (addr) => addr.addressId === billing?.matchingAddressId
    ) || customer?.preferredAddress;

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      dwfrm_billing_paymentMethod: "CREDIT_CARD",
      dwfrm_billing_shippingAddressUseAsBillingAddress: true,
      dwfrm_billing_creditCardFields_cardType:
        paymentCards.length > 0 ? paymentCards[0].cardType : "",
      dwfrm_billing_creditCardFields_cardNumber: "",
      dwfrm_billing_creditCardFields_cardOwner: "",
      dwfrm_billing_creditCardFields_expirationMonth: "",
      dwfrm_billing_creditCardFields_expirationYear: "",
      dwfrm_billing_creditCardFields_securityCode: "",
      dwfrm_billing_creditCardFields_saveCard: false,
      // Use billing address if available, otherwise use shipping address as default
      dwfrm_billing_addressFields_firstName:
        billing?.billingAddress?.address?.firstName ||
        shippingAddress?.firstName ||
        "",
      dwfrm_billing_addressFields_lastName:
        billing?.billingAddress?.address?.lastName ||
        shippingAddress?.lastName ||
        "",
      dwfrm_billing_addressFields_address1:
        billing?.billingAddress?.address?.address1 ||
        shippingAddress?.address1 ||
        "",
      dwfrm_billing_addressFields_address2:
        billing?.billingAddress?.address?.address2 ||
        shippingAddress?.address2 ||
        "",
      dwfrm_billing_addressFields_country:
        billing?.billingAddress?.address?.countryCode?.value ||
        shippingAddress?.countryCode?.value ||
        "US",
      dwfrm_billing_addressFields_city:
        billing?.billingAddress?.address?.city || shippingAddress?.city || "",
      dwfrm_billing_addressFields_postalCode:
        billing?.billingAddress?.address?.postalCode ||
        shippingAddress?.postalCode ||
        "",
      dwfrm_billing_contactInfoFields_phone:
        billing?.billingAddress?.address?.phone || shippingAddress?.phone || "",
      savedPaymentMethodUUID:
        savedPaymentMethods.length > 0
          ? savedPaymentMethods[0].UUID
          : undefined,
    },
  });

  const editForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      dwfrm_billing_addressFields_firstName: "",
      dwfrm_billing_addressFields_lastName: "",
      dwfrm_billing_addressFields_address1: "",
      dwfrm_billing_addressFields_address2: "",
      dwfrm_billing_addressFields_country: "US",
      dwfrm_billing_addressFields_city: "",
      dwfrm_billing_addressFields_postalCode: "",
      dwfrm_billing_contactInfoFields_phone: "",
    },
  });

  const submitPayment = useMutation({
    mutationFn: async (formData: z.infer<typeof paymentSchema>) => {
      // If using saved payment method
      if (showSavedCards && formData.savedPaymentMethodUUID) {
        const { data } = await axios.postForm(
          "/on/demandware.store/Sites-RefArch-Site/en_US/CheckoutServices-SubmitPayment",
          {
            ...formData,
            storedPaymentUUID: formData.savedPaymentMethodUUID,
            securityCode: "123",
            csrf_token: token,
          }
        );
        return data;
      }

      // Otherwise submit full payment form
      const { data } = await axios.postForm(
        "/on/demandware.store/Sites-RefArch-Site/en_US/CheckoutServices-SubmitPayment",
        {
          ...formData,
          csrf_token: token,
        }
      );
      return data;
    },
    onSuccess: () => {
      router.reload({
        data: {
          stage: "placeOrder",
        },
      });

      onSubmit();
    },
    onError: (error) => {
      console.error("Error submitting payment:", error);
    },
  });

  const updateBillingAddress = useMutation({
    mutationFn: async (formData: z.infer<typeof paymentSchema>) => {
      const { data } = await axios.postForm(
        "/on/demandware.store/Sites-RefArch-Site/en_US/Address-SaveAddress",
        {
          ...formData,
          addressId: editingAddress?.addressId,
          csrf_token: token,
        }
      );
      return data;
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      router.reload({
        data: {
          stage: "payment",
        },
      });
    },
    onError: (error) => {
      console.error("Error updating address:", error);
    },
  });

  // Set up edit form when editing an address
  useEffect(() => {
    if (editingAddress) {
      editForm.setValue(
        "dwfrm_billing_addressFields_firstName",
        editingAddress.firstName
      );
      editForm.setValue(
        "dwfrm_billing_addressFields_lastName",
        editingAddress.lastName
      );
      editForm.setValue(
        "dwfrm_billing_addressFields_address1",
        editingAddress.address1
      );
      editForm.setValue(
        "dwfrm_billing_addressFields_address2",
        editingAddress.address2 || ""
      );
      editForm.setValue(
        "dwfrm_billing_addressFields_country",
        editingAddress.countryCode.value
      );
      editForm.setValue(
        "dwfrm_billing_addressFields_city",
        editingAddress.city
      );
      editForm.setValue(
        "dwfrm_billing_addressFields_postalCode",
        editingAddress.postalCode
      );
      editForm.setValue(
        "dwfrm_billing_contactInfoFields_phone",
        editingAddress.phone
      );
    }
  }, [editingAddress, editForm]);

  useEffect(() => {
    // If we have shipping data and the user wants to edit billing (not using shipping as billing)
    if (!useShippingAsBilling && customer?.addresses?.length > 0) {
      // Find the shipping address that's being used
      const shippingAddress =
        customer.addresses.find(
          (addr) => addr.addressId === billing?.matchingAddressId
        ) || customer.preferredAddress;

      if (shippingAddress) {
        // Pre-fill the billing form with shipping address data
        form.setValue(
          "dwfrm_billing_addressFields_firstName",
          shippingAddress.firstName
        );
        form.setValue(
          "dwfrm_billing_addressFields_lastName",
          shippingAddress.lastName
        );
        form.setValue(
          "dwfrm_billing_addressFields_address1",
          shippingAddress.address1
        );
        form.setValue(
          "dwfrm_billing_addressFields_address2",
          shippingAddress.address2 || ""
        );
        form.setValue(
          "dwfrm_billing_addressFields_country",
          shippingAddress.countryCode.value
        );
        form.setValue("dwfrm_billing_addressFields_city", shippingAddress.city);
        form.setValue(
          "dwfrm_billing_addressFields_postalCode",
          shippingAddress.postalCode
        );
        form.setValue(
          "dwfrm_billing_contactInfoFields_phone",
          shippingAddress.phone
        );
      }
    }
  }, [useShippingAsBilling, customer, billing, form]);

  function handleSubmit(values: z.infer<typeof paymentSchema>) {
    submitPayment.mutate(values);
  }

  function handleEditSubmit(values: z.infer<typeof paymentSchema>) {
    updateBillingAddress.mutate(values);
  }

  function startEditingAddress(address: Address) {
    setEditingAddress(address);
    setIsEditDialogOpen(true);
  }

  // Watch for changes to sameAsShipping
  const sameAsShipping = form.watch(
    "dwfrm_billing_shippingAddressUseAsBillingAddress"
  );
  const paymentMethod = form.watch("dwfrm_billing_paymentMethod");


  console.log(form.formState.errors)

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Method</h3>

            <FormField
              control={form.control}
              name="dwfrm_billing_paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.ID} className="relative">
                          <RadioGroupItem
                            value={method.ID}
                            id={method.ID}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={method.ID}
                            className="flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            {method.ID === "CREDIT_CARD" ? (
                              <CreditCard className="h-8 w-8 mb-2" />
                            ) : (
                              <Wallet className="h-8 w-8 mb-2" />
                            )}
                            <span className="font-medium">{method.name}</span>
                          </Label>
                          <Check className="absolute hidden h-5 w-5 top-4 right-4 text-primary peer-data-[state=checked]:block" />
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {paymentMethod === "CREDIT_CARD" && (
            <div className="space-y-4">
              {savedPaymentMethods.length > 0 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Credit Card Information
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={showSavedCards ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowSavedCards(true)}
                    >
                      Saved Cards
                    </Button>
                    <Button
                      type="button"
                      variant={!showSavedCards ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowSavedCards(false)}
                    >
                      New Card
                    </Button>
                  </div>
                </div>
              )}

              {showSavedCards && savedPaymentMethods.length > 0 ? (
                <div className="gap-4 flex flex-col">
                  <FormField
                    control={form.control}
                    name="savedPaymentMethodUUID"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            {savedPaymentMethods.map((card) => (
                              <div
                                key={card.UUID}
                                className="flex items-start space-x-3"
                              >
                                <RadioGroupItem
                                  value={card.UUID}
                                  id={card.UUID}
                                  className="mt-1"
                                />
                                <Label
                                  htmlFor={card.UUID}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {card.creditCardType}{" "}
                                      {card.maskedCreditCardNumber}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Expires {card.creditCardExpirationMonth}/
                                    {card.creditCardExpirationYear}
                                  </p>
                                  <p className="text-sm">
                                    {card.creditCardHolder}
                                  </p>
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem
                                value="new-card"
                                id="new-card"
                                className="mt-1"
                                onClick={() => setShowSavedCards(false)}
                              />
                              <Label
                                htmlFor="new-card"
                                className="flex-1 cursor-pointer"
                              >
                                <span className="font-medium">
                                  Add a new card
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="securityCode"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Securuty Code</FormLabel>

                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_cardType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select card type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentCards.map((card) => (
                              <SelectItem
                                key={card.cardType}
                                value={card.cardType}
                              >
                                {card.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="4242 4242 4242 4242" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_cardOwner"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_expirationMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Month</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = i + 1;
                              return (
                                <SelectItem
                                  key={month}
                                  value={month.toString().padStart(2, "0")}
                                >
                                  {month.toString().padStart(2, "0")}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_expirationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expirationYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_securityCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Code (CVC)</FormLabel>
                        <FormControl>
                          <Input placeholder="123" maxLength={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_creditCardFields_saveCard"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Save this card for future purchases
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Billing Address</h3>
            </div>

            <FormField
              control={form.control}
              name="dwfrm_billing_shippingAddressUseAsBillingAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setUseShippingAsBilling(checked);
                        setShowBillingAddress(!checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Same as shipping address</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {sameAsShipping ? (
              <div className="border p-4 rounded-md mt-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Your billing address will be the same as your shipping
                  address.
                </p>
              </div>
            ) : (
              <>
                {billing?.billingAddress?.address && (
                  <div className="border p-4 rounded-md mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {billing.billingAddress.address.firstName}{" "}
                          {billing.billingAddress.address.lastName}
                        </p>
                        <p>{billing.billingAddress.address.address1}</p>
                        {billing.billingAddress.address.address2 && (
                          <p>{billing.billingAddress.address.address2}</p>
                        )}
                        <p>
                          {billing.billingAddress.address.city},{" "}
                          {billing.billingAddress.address.postalCode}
                        </p>
                        <p>
                          {
                            billing.billingAddress.address.countryCode
                              .displayValue
                          }
                        </p>
                        <p>{billing.billingAddress.address.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startEditingAddress(billing.billingAddress.address)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit address</span>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_address1"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_address2"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt, Suite, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="ME">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_addressFields_postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dwfrm_billing_contactInfoFields_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitPayment.isPending}
          >
            {submitPayment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Review Order"
            )}
          </Button>
        </form>
      </Form>

      {/* Edit Billing Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Billing Address</DialogTitle>
            <DialogDescription>
              Make changes to your billing address.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_address1"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_address2"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt, Suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="ME">Mexico</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_addressFields_postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dwfrm_billing_contactInfoFields_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateBillingAddress.isPending}>
                  {updateBillingAddress.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
