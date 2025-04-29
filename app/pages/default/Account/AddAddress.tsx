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
  Account_SaveProfile,
  Address_SaveAddress,
  createRouteHelpers,
} from "@/generated/routes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { AddAddressProps } from "@/types/response/add-address";

const FormSchema = z.object({
  dwfrm_address_addressId: z.string(),
  dwfrm_address_firstName: z.string().min(1, "First name is required"),
  dwfrm_address_lastName: z.string().min(1, "Last name is required"),
  dwfrm_address_address1: z.string().min(1, "Address line 1 is required"),
  dwfrm_address_address2: z.string().optional(),
  dwfrm_address_country: z.string().optional(),
  dwfrm_address_states_stateCode: z.string().min(1, "State is required"),
  dwfrm_address_phone: z.string().min(1, "Phone number is required"),
  dwfrm_address_city: z.string().min(1, "City is required"),
  dwfrm_address_postalCode: z.string().min(1, "Postal code is required"),
});

const resolver = zodResolver(FormSchema);

const AddAddress = (props: AddAddressProps) => {
  const form = useForm({
    resolver,
    defaultValues: {
      dwfrm_address_addressId: "",
      dwfrm_address_firstName: "",
      dwfrm_address_lastName: "",
      dwfrm_address_address1: "",
      dwfrm_address_address2: "",
      dwfrm_address_country:
        props.addressForm.country?.options?.[0]?.value || "",
      dwfrm_address_states_stateCode:
        props.addressForm.states.stateCode.options?.[0]?.value || "",
      dwfrm_address_phone: "",
      dwfrm_address_city: "",
      dwfrm_address_postalCode: "",
    },
  });

  const routes = createRouteHelpers({
    "Address-SaveAddress": Address_SaveAddress,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const { data: response } = await axios.postForm(
        routes.url("Address-SaveAddress"),
        {
          ...data,
          csrf_token: props.csrf.token,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      console.log(data);
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
            <MapPin className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Add New Address</CardTitle>
          </div>
          <CardDescription>
            Enter your address details to save to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <FormField
                name="dwfrm_address_addressId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Home" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_address_firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="dwfrm_address_lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="dwfrm_address_phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="dwfrm_address_address1"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="dwfrm_address_address2"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_address_country"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(props.addressForm.country?.options ?? []).map(
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
                  name="dwfrm_address_states_stateCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            props.addressForm.states.stateCode.options ?? []
                          ).map((opt, index) => (
                            <SelectItem key={"zip" + index} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_address_city"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="dwfrm_address_postalCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={form.handleSubmit(handleFormSubmit)}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Address"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

//@ts-ignore
AddAddress.layout = (page) => (
  <Layout>
    <AccountLayout>{page}</AccountLayout>
  </Layout>
);

export default AddAddress;
