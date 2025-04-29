import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Address_DeleteAddress,
  Address_EditAddress,
  createRouteHelpers,
} from "@/generated/routes";
import AccountLayout from "@/layouts/account";
import Layout from "@/layouts/default";
import type { AddressListProps } from "@/types/response/address-list";
import { Link } from "@inertiajs/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Edit, MapPin, Phone, Plus, Trash } from "lucide-react";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AddressList = (props: AddressListProps) => {
  const queryClient = useQueryClient();

  const routes = createRouteHelpers({
    "Address-EditAddress": Address_EditAddress,
    "Address-DeleteAddress": Address_DeleteAddress,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (addressId: string) => {
      const { data } = await axios.get(
        routes.url("Address-DeleteAddress", { addressId })
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => {
      console.error("Failed to delete address:", error);
    },
  });

  const handleDeleteAddress = useCallback(
    (addressId: string) => {
      mutate(addressId);
    },
    [mutate]
  );

  return (
    <Card className="max-w-2xl mx-auto shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">My Addresses</CardTitle>
        <Button size="sm" className="gap-1" asChild>
          <Link href="/account/addresses/add">
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {props.addressBook.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>You don't have any saved addresses yet.</p>
            <Button size="sm" className="mt-4 gap-1" asChild>
              <Link href="/account/addresses/add">
                <Plus className="h-4 w-4" />
                <span>Add Your First Address</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {props.addressBook.map((ad, index) => (
              <div
                key={ad.address.ID}
                className="bg-muted/30 p-4 rounded-lg border"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-base">
                    {ad.address.firstName} {ad.address.lastName}
                    <Badge variant="outline" className="ml-2 text-xs">
                      Default
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={routes.url("Address-EditAddress", {
                          addressId: ad.address.ID,
                        })}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(ad.address.ID)}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p>{ad.address.address1}</p>
                  {ad.address.address2 && <p>{ad.address.address2}</p>}
                  <p>
                    {ad.address.city}, {ad.address.stateCode}{" "}
                    {ad.address.postalCode}
                  </p>
                  {ad.address.countryCode && (
                    <p>{ad.address.countryCode.displayValue}</p>
                  )}

                  {ad.address.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground pt-1">
                      <Phone className="h-3 w-3" />
                      <span>{ad.address.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

//@ts-ignore
AddressList.layout = (page) => (
  <Layout>
    <AccountLayout>{page}</AccountLayout>
  </Layout>
);

export default AddressList;
