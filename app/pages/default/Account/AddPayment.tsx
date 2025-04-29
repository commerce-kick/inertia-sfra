"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AccountLayout from "@/layouts/account";
import Layout from "@/layouts/default";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  createRouteHelpers,
  PaymentInstruments_SavePayment,
} from "@/generated/routes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AddPaymentProps } from "@/types/response/add-payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { router } from "@inertiajs/react";

const FormSchema = z.object({
  "paymentOption-Credit": z.string().optional(),
  dwfrm_creditCard_cardOwner: z.string().min(1, "Name is required"),
  dwfrm_creditCard_cardNumber: z.string().min(1, "Card number is required"),
  dwfrm_creditCard_expirationMonth: z.number(),
  dwfrm_creditCard_expirationYear: z.string(),
  makeDefaultPayment: z.string().optional(),
  dwfrm_creditCard_cardType: z.string(),
});

const resolver = zodResolver(FormSchema);

const EditProfile = (props: AddPaymentProps) => {
  const form = useForm({
    resolver,
    defaultValues: {
      "paymentOption-Credit": "",
      dwfrm_creditCard_cardType: "Visa",
      dwfrm_creditCard_cardOwner: "",
      dwfrm_creditCard_cardNumber: "",
      dwfrm_creditCard_expirationMonth:
        props.paymentForm.expirationMonth.options[0]?.value || 0,
      dwfrm_creditCard_expirationYear: props.expirationYears[0],
      makeDefaultPayment: "On",
    },
  });

  const routes = createRouteHelpers({
    "PaymentInstruments-SavePayment": PaymentInstruments_SavePayment,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const { data: response } = await axios.postForm(
        routes.url("PaymentInstruments-SavePayment"),
        {
          ...data,
          csrf_token: props.csrf.token,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      router.visit(data.redirectUrl);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data);
    mutate(data);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Add Payment Method</CardTitle>
          </div>
          <CardDescription>
            Enter your credit card information to save it to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <FormField
                name="paymentOption-Credit"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Credit" id="credit" />
                          <FormLabel
                            htmlFor="credit"
                            className="font-normal cursor-pointer"
                          >
                            Credit Card
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="dwfrm_creditCard_cardOwner"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="dwfrm_creditCard_cardNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="•••• •••• •••• ••••" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_creditCard_expirationMonth"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Month</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {props.paymentForm.expirationMonth.options.map(
                            (opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  name="dwfrm_creditCard_expirationYear"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {props.expirationYears.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* <FormField
                name="makeDefaultPayment"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Payment</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={form.handleSubmit(handleFormSubmit)}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Payment Method"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

//@ts-ignore
EditProfile.layout = (page) => (
  <Layout>
    <AccountLayout>{page}</AccountLayout>
  </Layout>
);

export default EditProfile;
