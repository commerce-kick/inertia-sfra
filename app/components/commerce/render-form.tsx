"use client";

import { useState } from "react";
import { useZodForm } from "@/hooks/use-zod-form";
import type { ServerFormDefinition } from "@/types/form";
import {
  flattenFormDefinition,
  isCheckboxField,
  isSelectField,
} from "@/lib/form-utils";
import type { z } from "zod";

import {
  Form,
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RenderFormProps {
  formDefinition: ServerFormDefinition;
  onSubmit: (data: any) => void;
  submitText?: string;
  /**
   * Array of field names to exclude from rendering
   * Use the htmlName property of the field (e.g., "dwfrm_profile_customer_gender")
   */
  excludeFields?: string[];
  /**
   * Alternative to excludeFields: only include these fields
   * If provided, excludeFields will be ignored
   */
  includeFields?: string[];
  /**
   * Array of field names to position at the bottom of the form (above submit button)
   * Fields will be ordered as they appear in this array (first item will be highest)
   * Use the htmlName property of the field (e.g., "dwfrm_profile_customer_addtoemaillist")
   */
  bottomFields?: string[];
  /**
   * Array of field names to position at the top of the form
   * Fields will be ordered as they appear in this array
   * Use the htmlName property of the field (e.g., "dwfrm_profile_customer_firstname")
   */
  topFields?: string[];
}

export function RenderForm({
  formDefinition,
  onSubmit,
  submitText = "Submit",
  excludeFields = [],
  includeFields,
  bottomFields = [],
  topFields = [],
}: RenderFormProps) {
  const { form, zodSchema } = useZodForm(formDefinition, {
    excludeFields,
    includeFields,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: z.infer<typeof zodSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all form fields flattened
  const flatFields = flattenFormDefinition(formDefinition);

  // Filter fields based on include/exclude options
  const filteredFields = Object.entries(flatFields).filter(([fieldName]) => {
    if (includeFields) {
      return includeFields.includes(fieldName);
    }
    return !excludeFields.includes(fieldName);
  });

  // Sort fields based on positioning options
  const sortedFields = [...filteredFields].sort((a, b) => {
    const [fieldNameA] = a;
    const [fieldNameB] = b;

    // Check if fields are in topFields or bottomFields
    const isTopA = topFields.includes(fieldNameA);
    const isTopB = topFields.includes(fieldNameB);
    const isBottomA = bottomFields.includes(fieldNameA);
    const isBottomB = bottomFields.includes(fieldNameB);

    // If both fields are in topFields, sort by their index in topFields
    if (isTopA && isTopB) {
      return topFields.indexOf(fieldNameA) - topFields.indexOf(fieldNameB);
    }

    // If both fields are in bottomFields, sort by their index in bottomFields
    if (isBottomA && isBottomB) {
      return (
        bottomFields.indexOf(fieldNameA) - bottomFields.indexOf(fieldNameB)
      );
    }

    // Top fields come first
    if (isTopA) return -1;
    if (isTopB) return 1;

    // Bottom fields come last (but before submit button)
    if (isBottomA) return 1;
    if (isBottomB) return -1;

    // Default: keep original order
    return 0;
  });

  // Separate fields into top, middle, and bottom sections
  const topSectionFields = sortedFields.filter(([fieldName]) =>
    topFields.includes(fieldName)
  );
  const bottomSectionFields = sortedFields.filter(([fieldName]) =>
    bottomFields.includes(fieldName)
  );
  const middleSectionFields = sortedFields.filter(
    ([fieldName]) =>
      !topFields.includes(fieldName) && !bottomFields.includes(fieldName)
  );

  // Function to render a field
  const renderField = ([fieldName, field]: [string, any]) => {
    const isCheckbox = isCheckboxField(field);
    const isSelect = isSelectField(field);
    const isPassword = field.htmlName.toLowerCase().includes("password");
    const isEmail = field.htmlName.toLowerCase().includes("email");
    const isPhone = field.htmlName.toLowerCase().includes("phone");

    return (
      <ShadcnFormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        render={({ field: formField }) => (
          <FormItem
            className={
              isCheckbox
                ? "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                : ""
            }
          >
            {isCheckbox ? (
              <>
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    name={field.htmlName}
                    id={field.htmlName}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor={field.htmlName}>{field.label}</FormLabel>
                </div>
              </>
            ) : isSelect ? (
              <>
                <FormLabel htmlFor={field.htmlName}>{field.label}</FormLabel>
                <Select
                  name={field.htmlName}
                  value={formField.value}
                  onValueChange={formField.onChange}
                >
                  <FormControl>
                    <SelectTrigger id={field.htmlName}>
                      <SelectValue placeholder={field.label} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <FormLabel htmlFor={field.htmlName}>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    id={field.htmlName}
                    name={field.htmlName}
                    type={
                      isPassword
                        ? "password"
                        : isEmail
                        ? "email"
                        : isPhone
                        ? "tel"
                        : "text"
                    }
                    placeholder={field.label}
                    required={field.mandatory && field.mandatory !== ""}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                  />
                </FormControl>
              </>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Top section fields */}
        {topSectionFields.map(renderField)}

        {/* Middle section fields (default position) */}
        {middleSectionFields.map(renderField)}

        {/* Bottom section fields */}
        {bottomSectionFields.map(renderField)}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : submitText}
        </Button>
      </form>
    </Form>
  );
}
