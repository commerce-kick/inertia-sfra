"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import {
  Account_Login,
  CheckoutServices_SubmitCustomer,
  getUrl,
} from "@/generated/routes";

const customerSchema = z.object({
  dwfrm_coCustomer_email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
});

const loginSchema = z.object({
  loginEmail: z.string().email("Please enter a valid email address"),
  loginPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type CustomerFormProps = {
  token: string;
  onSubmit: () => void;
  initialEmail?: string;
};

export default function CustomerForm({
  token,
  onSubmit,
  initialEmail = "",
}: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState("guest");

  const guestForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      dwfrm_coCustomer_email: initialEmail,
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginEmail: initialEmail,
      loginPassword: "",
    },
  });

  const submitCustomer = useMutation({
    mutationFn: async (formData: z.infer<typeof customerSchema>) => {
      const { data } = await axios.postForm(
        getUrl(CheckoutServices_SubmitCustomer),
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
          stage: "shipping",
        },
      });
      onSubmit();
    },
    onError: (error) => {
      console.error("Error submitting customer:", error);
    },
  });

  const submitLogin = useMutation({
    mutationFn: async (formData: z.infer<typeof loginSchema>) => {
      const { data } = await axios.postForm(getUrl(Account_Login), {
        ...formData,
        csrf_token: token,
      });
      return data;
    },
    onSuccess: () => {
      router.reload({
        data: {
          stage: "shipping",
        },
      });
      onSubmit();
    },
    onError: (error) => {
      console.error("Error logging in:", error);
      loginForm.setError("loginPassword", {
        type: "manual",
        message: "Invalid email or password",
      });
    },
  });

  function handleGuestSubmit(values: z.infer<typeof customerSchema>) {
    submitCustomer.mutate(values);
  }

  function handleLoginSubmit(values: z.infer<typeof loginSchema>) {
    submitLogin.mutate(values);
  }

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guest">Guest Checkout</TabsTrigger>
          <TabsTrigger value="login">Sign In</TabsTrigger>
        </TabsList>

        <TabsContent value="guest">
          <Form {...guestForm}>
            <form
              onSubmit={guestForm.handleSubmit(handleGuestSubmit)}
              className="space-y-6"
            >
              <FormField
                control={guestForm.control}
                name="dwfrm_coCustomer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll send your order confirmation to this email address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={submitCustomer.isPending}
              >
                {submitCustomer.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue as Guest"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="login">
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
              className="space-y-6"
            >
              <FormField
                control={loginForm.control}
                name="loginEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="loginPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={submitLogin.isPending}
              >
                {submitLogin.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
