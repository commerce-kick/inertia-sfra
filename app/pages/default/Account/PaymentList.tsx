import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createRouteHelpers,
  PaymentInstruments_AddPayment,
  PaymentInstruments_DeletePayment,
} from "@/generated/routes";
import AccountLayout from "@/layouts/account";
import Layout from "@/layouts/default";
import type { PaymentListProps } from "@/types/response/payment-list";
import { Link } from "@inertiajs/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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
import { CreditCard, Plus, Trash } from "lucide-react";
import { useCallback } from "react";

const PaymentList = (props: PaymentListProps) => {
  const queryClient = useQueryClient();

  const routes = createRouteHelpers({
    "PaymentInstruments-DeletePayment": PaymentInstruments_DeletePayment,
    "PaymentInstruments-AddPayment": PaymentInstruments_AddPayment,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (UUID: string) => {
      const { data } = await axios.get(
        routes.url("PaymentInstruments-DeletePayment", { UUID })
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      console.error("Failed to delete payment method:", error);
    },
  });

  const handleDeletePayment = useCallback(
    (uuid: string) => {
      mutate(uuid);
    },
    [mutate]
  );

  // Function to get credit card type icon/class
  const getCardTypeClass = (type: string) => {
    const typeLC = type.toLowerCase();
    if (typeLC.includes("visa")) return "border-blue-500";
    if (typeLC.includes("master")) return "border-orange-500";
    if (typeLC.includes("amex")) return "border-green-500";
    if (typeLC.includes("discover")) return "border-purple-500";
    return "border-gray-300";
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Payment Methods</CardTitle>
        <Button size="sm" className="gap-1" asChild>
          <Link href={routes.url("PaymentInstruments-AddPayment")}>
            <Plus className="h-4 w-4" />
            <span>Add Payment Method</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {props.paymentInstruments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>You don't have any saved payment methods yet.</p>
            <Button size="sm" className="mt-4 gap-1" asChild>
              <Link href={routes.url("PaymentInstruments-AddPayment")}>
                <Plus className="h-4 w-4" />
                <span>Add Your First Payment Method</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {props.paymentInstruments.map((payment) => (
              <div
                key={payment.UUID}
                className={`bg-muted/30 p-4 rounded-lg border-l-4 ${getCardTypeClass(payment.creditCardType)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {payment.creditCardType}
                      </span>
                      {/* {payment.defaultPayment && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )} */}
                    </div>
                    <p className="text-lg font-mono">
                      {payment.maskedCreditCardNumber}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Expires: {payment.creditCardExpirationMonth}/
                      {payment.creditCardExpirationYear}
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Payment Method
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this payment method?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePayment(payment.UUID)}
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

//@ts-ignore
PaymentList.layout = (page) => (
  <Layout>
    <AccountLayout>{page}</AccountLayout>
  </Layout>
);

export default PaymentList;
