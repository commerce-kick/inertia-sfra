// Types for the server form definition
export interface FormFieldOption {
  checked: boolean;
  htmlValue: string;
  label: string;
  id: string;
  selected: boolean;
  value: string;
}

export interface FormField {
  htmlValue: string;
  mandatory: boolean | string;
  dynamicHtmlName: string;
  htmlName: string;
  valid: boolean;
  label: string;
  maxLength?: number;
  minLength?: number;
  regEx?: string | null;
  formType: "formField";
  type?: string;
  checked?: boolean;
  selected?: boolean;
  options?: FormFieldOption[];
  selectedOption?: string;
}

export interface FormGroup {
  valid: boolean;
  htmlName: string;
  dynamicHtmlName: string;
  error: string | null;
  attributes: string;
  formType: "formGroup";
  [key: string]: FormField | FormGroup | string | boolean | null;
}

export type ServerFormDefinition = FormGroup;
