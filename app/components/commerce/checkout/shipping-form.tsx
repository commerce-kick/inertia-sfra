"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, Plus, Pencil, Loader2 } from "lucide-react"
import type { CheckoutResponse, Shipping, Address } from "@/types/response/checkout"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { router } from "@inertiajs/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const shippingSchema = z.object({
  dwfrm_shipping_shippingAddress_addressFields_addressId: z.string().optional(),
  dwfrm_shipping_shippingAddress_addressFields_firstName: z.string().min(1, { message: "First name is required" }),
  dwfrm_shipping_shippingAddress_addressFields_lastName: z.string().min(1, { message: "Last name is required" }),
  dwfrm_shipping_shippingAddress_addressFields_address1: z.string().min(1, { message: "Address is required" }),
  dwfrm_shipping_shippingAddress_addressFields_address2: z.string().optional(),
  dwfrm_shipping_shippingAddress_addressFields_country: z.string().min(1, { message: "Country is required" }),
  dwfrm_shipping_shippingAddress_addressFields_city: z.string().min(1, { message: "City is required" }),
  dwfrm_shipping_shippingAddress_addressFields_postalCode: z.string().min(1, { message: "Postal code is required" }),
  dwfrm_shipping_shippingAddress_addressFields_phone: z.string().min(1, { message: "Phone number is required" }),
  dwfrm_shipping_shippingAddress_shippingMethodID: z.string().min(1, { message: "Please select a shipping method" }),
})

type ShippingFormProps = {
  token: string
  onSubmit: () => void
  customer?: CheckoutResponse["customer"]
  shipping?: Shipping[]
}

export default function ShippingForm({ token, onSubmit, customer, shipping }: ShippingFormProps) {

  console.log(shipping?.[0].applicableShippingMethods);

  const [addressMode, setAddressMode] = useState<"saved" | "new">(
    customer?.addresses && customer.addresses.length > 0 ? "saved" : "new",
  )
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const savedAddresses = customer?.addresses || []
  const shippingMethods = shipping?.[0]?.applicableShippingMethods || []
  const model = shipping?.[0]

  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      dwfrm_shipping_shippingAddress_addressFields_addressId:
        savedAddresses.length > 0 ? savedAddresses[0].addressId || "" : undefined,
      dwfrm_shipping_shippingAddress_addressFields_firstName: model?.shippingAddress?.firstName || "",
      dwfrm_shipping_shippingAddress_addressFields_lastName: model?.shippingAddress?.lastName || "",
      dwfrm_shipping_shippingAddress_addressFields_address1: model?.shippingAddress?.address1 || "",
      dwfrm_shipping_shippingAddress_addressFields_address2: model?.shippingAddress?.address2 || "",
      dwfrm_shipping_shippingAddress_addressFields_country: model?.shippingAddress?.countryCode?.value || "US",
      dwfrm_shipping_shippingAddress_addressFields_city: model?.shippingAddress?.city || "",
      dwfrm_shipping_shippingAddress_addressFields_postalCode: model?.shippingAddress?.postalCode || "",
      dwfrm_shipping_shippingAddress_addressFields_phone: model?.shippingAddress?.phone || "",
      dwfrm_shipping_shippingAddress_shippingMethodID:
        model?.selectedShippingMethod?.ID || (shippingMethods.length > 0 ? shippingMethods[0].ID : ""),
    },
  })

  const editForm = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      dwfrm_shipping_shippingAddress_addressFields_firstName: "",
      dwfrm_shipping_shippingAddress_addressFields_lastName: "",
      dwfrm_shipping_shippingAddress_addressFields_address1: "",
      dwfrm_shipping_shippingAddress_addressFields_address2: "",
      dwfrm_shipping_shippingAddress_addressFields_country: "US",
      dwfrm_shipping_shippingAddress_addressFields_city: "",
      dwfrm_shipping_shippingAddress_addressFields_postalCode: "",
      dwfrm_shipping_shippingAddress_addressFields_phone: "",
      dwfrm_shipping_shippingAddress_shippingMethodID:
        model?.selectedShippingMethod?.ID || (shippingMethods.length > 0 ? shippingMethods[0].ID : ""),
    },
  })

  const submitShipping = useMutation({
    mutationFn: async (formData: z.infer<typeof shippingSchema>) => {
      const { data } = await axios.postForm(
        "/on/demandware.store/Sites-RefArch-Site/en_US/CheckoutShippingServices-SubmitShipping",
        { ...formData, csrf_token: token },
      )
      return data
    },
    onSuccess: () => {
      router.reload({
        data: {
          stage: "payment",
        },
      })

      onSubmit()
    },
    onError: (error) => {
      console.error("Error submitting shipping:", error)
    },
  })

  const updateMethod = useMutation({
    mutationFn: async (formData: z.infer<typeof shippingSchema>) => {
      const { data } = await axios.postForm(
        "/on/demandware.store/Sites-RefArch-Site/en_US/CheckoutShippingServices-SelectShippingMethod",
        {
          firstName: formData.dwfrm_shipping_shippingAddress_addressFields_firstName,
          lastName: formData.dwfrm_shipping_shippingAddress_addressFields_lastName,
          address1: formData.dwfrm_shipping_shippingAddress_addressFields_address1,
          address2: formData.dwfrm_shipping_shippingAddress_addressFields_address2,
          city: formData.dwfrm_shipping_shippingAddress_addressFields_city,
          postalCode: formData.dwfrm_shipping_shippingAddress_addressFields_postalCode,
          countryCode: formData.dwfrm_shipping_shippingAddress_addressFields_country,
          phone: formData.dwfrm_shipping_shippingAddress_addressFields_phone,
          shipmentUUID: shipping?.[0].UUID,
          methodID: formData.dwfrm_shipping_shippingAddress_shippingMethodID,
          isGift: false,
          giftMessage: "",
          csrf_token: token,
        },
      )
      return data
    },
    onSuccess: () => {
      router.reload({
        data: {
          stage: "shipping",
        },
      })
    },
    onError: (error) => {
      console.error("Error updating shipping method:", error)
    },
  })

  const updateAddress = useMutation({
    mutationFn: async (formData: z.infer<typeof shippingSchema>) => {
      const { data } = await axios.postForm("/on/demandware.store/Sites-RefArch-Site/en_US/Address-SaveAddress", {
        ...formData,
        addressId: editingAddress?.addressId,
        csrf_token: token,
      })
      return data
    },
    onSuccess: () => {
      setIsEditDialogOpen(false)
      router.reload({
        data: {
          stage: "shipping",
        },
      })
    },
    onError: (error) => {
      console.error("Error updating address:", error)
    },
  })

  // Update form with selected address data
  useEffect(() => {
    if (addressMode === "saved" && savedAddresses.length > 0) {
      const addressId =
        form.getValues("dwfrm_shipping_shippingAddress_addressFields_addressId") || savedAddresses[0].addressId || ""
      const selectedAddress = savedAddresses.find((addr) => addr.addressId === addressId) || savedAddresses[0]

      form.setValue("dwfrm_shipping_shippingAddress_addressFields_firstName", selectedAddress.firstName)
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_lastName", selectedAddress.lastName)
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_address1", selectedAddress.address1)
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_address2", selectedAddress.address2 || "")
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_country", selectedAddress.countryCode.value)
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_city", selectedAddress.city)
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_postalCode", selectedAddress.postalCode)
      form.setValue("dwfrm_shipping_shippingAddress_addressFields_phone", selectedAddress.phone)
    }
  }, [addressMode, form, savedAddresses])

  // Set up edit form when editing an address
  useEffect(() => {
    if (editingAddress) {
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_firstName", editingAddress.firstName)
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_lastName", editingAddress.lastName)
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_address1", editingAddress.address1)
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_address2", editingAddress.address2 || "")
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_country", editingAddress.countryCode.value)
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_city", editingAddress.city)
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_postalCode", editingAddress.postalCode)
      editForm.setValue("dwfrm_shipping_shippingAddress_addressFields_phone", editingAddress.phone)
      editForm.setValue(
        "dwfrm_shipping_shippingAddress_shippingMethodID",
        form.getValues("dwfrm_shipping_shippingAddress_shippingMethodID"),
      )
    }
  }, [editingAddress, editForm])

  const handleOnShippingChange = useCallback(
    (values: z.infer<typeof shippingSchema>) => {
      updateMethod.mutate(values)
    },
    [updateMethod],
  )

  function handleSubmit(values: z.infer<typeof shippingSchema>) {
    submitShipping.mutate(values)
  }

  function handleEditSubmit(values: z.infer<typeof shippingSchema>) {
    updateAddress.mutate(values)
  }

  function startEditingAddress(address: Address) {
    setEditingAddress(address)
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Shipping Address</h3>
              {savedAddresses.length > 0 && (
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={addressMode === "saved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddressMode("saved")}
                  >
                    Saved Addresses
                  </Button>
                  <Button
                    type="button"
                    variant={addressMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddressMode("new")}
                  >
                    New Address
                  </Button>
                </div>
              )}
            </div>

            {addressMode === "saved" && savedAddresses.length > 0 ? (
              <FormField
                control={form.control}
                name="dwfrm_shipping_shippingAddress_addressFields_addressId"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Update form with selected address data
                          const selectedAddress = savedAddresses.find((addr) => addr.addressId === value)
                          if (selectedAddress) {
                            form.setValue(
                              "dwfrm_shipping_shippingAddress_addressFields_firstName",
                              selectedAddress.firstName,
                            )
                            form.setValue(
                              "dwfrm_shipping_shippingAddress_addressFields_lastName",
                              selectedAddress.lastName,
                            )
                            form.setValue(
                              "dwfrm_shipping_shippingAddress_addressFields_address1",
                              selectedAddress.address1,
                            )
                            form.setValue(
                              "dwfrm_shipping_shippingAddress_addressFields_address2",
                              selectedAddress.address2 || "",
                            )
                            form.setValue(
                              "dwfrm_shipping_shippingAddress_addressFields_country",
                              selectedAddress.countryCode.value,
                            )
                            form.setValue("dwfrm_shipping_shippingAddress_addressFields_city", selectedAddress.city)
                            form.setValue(
                              "dwfrm_shipping_shippingAddress_addressFields_postalCode",
                              selectedAddress.postalCode,
                            )
                            form.setValue("dwfrm_shipping_shippingAddress_addressFields_phone", selectedAddress.phone)
                          }
                        }}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {savedAddresses.map((address) => (
                          <div key={address.addressId} className="relative">
                            <RadioGroupItem
                              value={address.addressId || ""}
                              id={address.addressId || ""}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={address.addressId || ""}
                              className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            >
                              <span className="font-medium">
                                {address.firstName} {address.lastName}
                              </span>
                              <span>{address.address1}</span>
                              {address.address2 && <span>{address.address2}</span>}
                              <span>
                                {address.city}, {address.postalCode}
                              </span>
                              <span>{address.countryCode.displayValue}</span>
                              <span>{address.phone}</span>
                            </Label>
                            <Check className="absolute hidden h-5 w-5 top-4 right-4 text-primary peer-data-[state=checked]:block" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute bottom-4 right-4"
                              onClick={(e) => {
                                e.preventDefault()
                                startEditingAddress(address)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit address</span>
                            </Button>
                          </div>
                        ))}
                        <div className="relative">
                          <RadioGroupItem
                            value="new-address"
                            id="new-address"
                            className="peer sr-only"
                            onClick={() => setAddressMode("new")}
                          />
                          <Label
                            htmlFor="new-address"
                            className="flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer h-full min-h-[150px] border-dashed"
                          >
                            <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                            <span className="font-medium text-muted-foreground">Add New Address</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dwfrm_shipping_shippingAddress_addressFields_firstName"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_lastName"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_address1"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_address2"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="dwfrm_shipping_shippingAddress_addressFields_city"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_postalCode"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_phone"
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
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shipping Method</h3>

            <FormField
              control={form.control}
              name="dwfrm_shipping_shippingAddress_shippingMethodID"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(v) => {
                        field.onChange(v)
                        handleOnShippingChange(form.getValues())
                      }}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      {shippingMethods.map((method) => (
                        <div key={method.ID} className="flex items-start space-x-3">
                          <RadioGroupItem value={method.ID} id={method.ID} className="mt-1" />
                          <Label htmlFor={method.ID} className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <span className="font-medium">{method.displayName}</span>
                              <span className="font-medium">{method.shippingCost}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                            <p className="text-sm">Estimated delivery: {method.estimatedArrivalTime}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitShipping.isPending}>
            {submitShipping.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </form>
      </Form>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>Make changes to your shipping address.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="dwfrm_shipping_shippingAddress_addressFields_firstName"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_lastName"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_address1"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_address2"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="dwfrm_shipping_shippingAddress_addressFields_city"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_postalCode"
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
                  name="dwfrm_shipping_shippingAddress_addressFields_phone"
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
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAddress.isPending}>
                  {updateAddress.isPending ? (
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
  )
}
