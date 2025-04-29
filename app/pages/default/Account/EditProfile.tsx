import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AccountLayout from "@/layouts/account";
import Layout from "@/layouts/default";
import type { EditAccountProps } from "@/types/response/EditAccount";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Account_SaveProfile, createRouteHelpers } from "@/generated/routes";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { toast } from "sonner";

const FormSchema = z
  .object({
    dwfrm_profile_customer_firstname: z
      .string()
      .min(1, "First name is required"),
    dwfrm_profile_customer_lastname: z.string().min(1, "Last name is required"),
    dwfrm_profile_customer_phone: z.string().optional(),
    dwfrm_profile_customer_email: z.string().email("Invalid email address"),
    dwfrm_profile_customer_emailconfirm: z
      .string()
      .email("Invalid email address"),
    dwfrm_profile_login_password: z.string().optional(),
    dwfrm_profile_customer_addtoemaillist: z.boolean(),
    dwfrm_profile_customer_gender: z.number(),
  })
  .refine(
    (data) =>
      data.dwfrm_profile_customer_email ===
      data.dwfrm_profile_customer_emailconfirm,
    {
      message: "Email addresses must match",
      path: ["dwfrm_profile_customer_emailconfirm"],
    }
  );

const resolver = zodResolver(FormSchema);

const EditProfile = (props: EditAccountProps) => {
  const form = useForm({
    resolver,
    defaultValues: {
      dwfrm_profile_customer_email: props.currentCustomer.profile.email,
      dwfrm_profile_customer_emailconfirm: props.currentCustomer.profile.email,
      dwfrm_profile_customer_firstname: props.currentCustomer.profile.firstName,
      dwfrm_profile_customer_lastname: props.currentCustomer.profile.lastName,
      dwfrm_profile_customer_phone: props.currentCustomer.profile.phone || "",
      dwfrm_profile_customer_addtoemaillist: true,
      dwfrm_profile_customer_gender: 1,
      dwfrm_profile_login_password: "",
    },
  });

  const routes = createRouteHelpers({
    "Account-SaveProfile": Account_SaveProfile,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const { data: response } = await axios.postForm(
        routes.url("Account-SaveProfile"),
        {
          ...data,
          csrf_token: props.csrf.token,
        }
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error("Error");
    },
  });

  const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
    mutate(data);
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Edit Profile</CardTitle>
        </div>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
            name="dwfrm_profile"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_profile_customer_firstname"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="dwfrm_profile_customer_lastname"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_profile_customer_phone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="dwfrm_profile_customer_gender"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {props.profileForm.customer.gender?.options?.map(
                            (option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="dwfrm_profile_customer_email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="dwfrm_profile_customer_emailconfirm"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="dwfrm_profile_login_password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to keep your current password
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="dwfrm_profile_customer_addtoemaillist"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Email Subscription</FormLabel>
                      <FormDescription>
                        Receive updates about new products, promotions, and
                        special offers
                      </FormDescription>
                    </div>
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
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

//@ts-ignore
EditProfile.layout = (page) => (
  <Layout>
    <AccountLayout>{page}</AccountLayout>
  </Layout>
);

export default EditProfile;
