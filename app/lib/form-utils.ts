import { z } from "zod";
import type { FormField, FormGroup, ServerFormDefinition } from "@/types/form";

// Helper to check if a property is a FormField
const isFormField = (value: any): value is FormField => {
  return value && typeof value === "object" && value.formType === "formField";
};

// Helper to check if a property is a FormGroup
const isFormGroup = (value: any): value is FormGroup => {
  return value && typeof value === "object" && value.formType === "formGroup";
};

// Helper to determine if a field is a checkbox
export const isCheckboxField = (field: FormField): boolean => {
  // Check if the field is a boolean type or has a boolean value
  return (
    field.type === "checkbox" ||
    field.htmlValue === "true" ||
    field.htmlValue === "false" ||
    typeof field.checked !== "undefined" ||
    field.label.toLowerCase().includes("subscribe") ||
    field.label.toLowerCase().includes("add me") ||
    field.label.toLowerCase().includes("opt in") ||
    field.label.toLowerCase().includes("agree") ||
    field.label.toLowerCase().includes("accept")
  );
};

// Helper to determine if a field is a select/dropdown
export const isSelectField = (field: FormField): boolean => {
  return Array.isArray(field.options) && field.options.length > 0;
};

// Convert server form definition to a flat object of fields
export const flattenFormDefinition = (
  definition: ServerFormDefinition,
  prefix = ""
): Record<string, FormField> => {
  const fields: Record<string, FormField> = {};

  Object.entries(definition).forEach(([key, value]) => {
    if (isFormField(value)) {
      // Use the htmlName as the key instead of the dynamicHtmlName
      fields[value.htmlName] = value;
    } else if (isFormGroup(value)) {
      const nestedFields = flattenFormDefinition(
        value,
        prefix ? `${prefix}.${key}` : key
      );
      Object.assign(fields, nestedFields);
    }
  });

  return fields;
};

interface SchemaOptions {
  excludeFields?: string[];
  includeFields?: string[];
}

// Create a Zod schema from the server form definition
export const createZodSchema = (
  definition: ServerFormDefinition,
  options: SchemaOptions = {}
): z.ZodObject<any> => {
  const shape: Record<string, z.ZodTypeAny> = {};
  const flatFields = flattenFormDefinition(definition);

  // Create maps to track field relationships
  const passwordPairs: Record<string, string> = {};
  const emailPairs: Record<string, string> = {};

  Object.entries(flatFields).forEach(([key, field]) => {
    // Skip excluded fields or only include specified fields
    if (
      (options.includeFields && !options.includeFields.includes(key)) ||
      (options.excludeFields && options.excludeFields.includes(key))
    ) {
      return;
    }

    // Determine field type
    const isCheckbox = isCheckboxField(field);
    const isSelect = isSelectField(field);

    // Create appropriate schema based on field type
    let schema: z.ZodTypeAny;

    if (isCheckbox) {
      // Boolean schema for checkboxes
      schema = z.boolean();

      // Handle mandatory checkboxes
      if (field.mandatory && field.mandatory !== "") {
        schema = schema.refine((val) => val === true, {
          message: `${field.label} is required`,
        });
      }
    } else if (isSelect) {
      // Create an enum schema from the select options
      const validValues = field.options?.map((opt) => opt.value) || [];
      schema = z.enum(["" as const, ...(validValues as [string, ...string[]])]);

      // Handle mandatory selects
      if (field.mandatory && field.mandatory !== "") {
        schema = schema.refine((val) => val !== "", {
          message: `${field.label} is required`,
        });
      }
    } else {
      // String schema for text inputs
      schema = z.string();

      // Handle mandatory text fields
      if (field.mandatory && field.mandatory !== "") {
        schema = schema.min(1, { message: `${field.label} is required` });
      }

      // Apply string-specific validations
      if (field.minLength) {
        schema = schema.min(field.minLength, {
          message: `${field.label} must be at least ${field.minLength} characters`,
        });
      }

      if (field.maxLength) {
        schema = schema.max(field.maxLength, {
          message: `${field.label} must be at most ${field.maxLength} characters`,
        });
      }

      if (field.regEx) {
        schema = schema.regex(new RegExp(field.regEx), {
          message: `${field.label} has an invalid format`,
        });
      }
    }

    // Track password confirmation fields
    if (
      field.htmlName.includes("passwordconfirm") ||
      field.htmlName.includes("newpasswordconfirm")
    ) {
      const baseFieldName = field.htmlName.replace("confirm", "");

      for (const [otherKey, otherField] of Object.entries(flatFields)) {
        if (otherField.htmlName === baseFieldName) {
          passwordPairs[key] = otherKey;
          break;
        }
      }
    }

    // Track email confirmation fields
    if (field.htmlName.includes("emailconfirm")) {
      const baseFieldName = field.htmlName.replace("confirm", "");

      for (const [otherKey, otherField] of Object.entries(flatFields)) {
        if (otherField.htmlName === baseFieldName) {
          emailPairs[key] = otherKey;
          break;
        }
      }
    }

    shape[key] = schema;
  });

  // Create base schema
  let baseSchema = z.object(shape);

  // Add password confirmation validation
  if (Object.keys(passwordPairs).length > 0) {
    baseSchema = baseSchema.refine(
      (data) => {
        for (const [confirmKey, passwordKey] of Object.entries(passwordPairs)) {
          if (data[confirmKey] !== data[passwordKey]) {
            return false;
          }
        }
        return true;
      },
      {
        message: "Passwords do not match",
        path: [Object.keys(passwordPairs)[0]],
      }
    );
  }

  // Add email confirmation validation
  if (Object.keys(emailPairs).length > 0) {
    baseSchema = baseSchema.refine(
      (data) => {
        for (const [confirmKey, emailKey] of Object.entries(emailPairs)) {
          if (data[confirmKey] !== data[emailKey]) {
            return false;
          }
        }
        return true;
      },
      {
        message: "Email addresses do not match",
        path: [Object.keys(emailPairs)[0]],
      }
    );
  }

  return baseSchema;
};

// Extract default values from form definition
export const extractDefaultValues = (
  definition: ServerFormDefinition,
  options: SchemaOptions = {}
): Record<string, any> => {
  const defaultValues: Record<string, any> = {};
  const flatFields = flattenFormDefinition(definition);

  Object.entries(flatFields).forEach(([key, field]) => {
    // Skip excluded fields or only include specified fields
    if (
      (options.includeFields && !options.includeFields.includes(key)) ||
      (options.excludeFields && options.excludeFields.includes(key))
    ) {
      return;
    }

    if (isCheckboxField(field)) {
      defaultValues[key] = field.htmlValue === "true" || field.checked === true;
    } else if (isSelectField(field)) {
      // Find the selected option or default to empty string
      const selectedOption = field.options?.find((opt) => opt.selected);
      defaultValues[key] = selectedOption ? selectedOption.value : "";
    } else {
      defaultValues[key] = field.htmlValue || "";
    }
  });

  return defaultValues;
};
