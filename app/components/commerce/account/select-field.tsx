import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IFormFieldData } from "@/generated/data";
import { cn } from "@/lib/utils";

/**
 * One field of a server-declared form whose choices the merchant owns:
 * country, state, expiry month, expiry year.
 *
 * SFRA form definitions open an option list with a blank entry — `states.xml`
 * and `creditCard.xml` both do — because an HTML `<select>` needs a row to sit
 * on before anything is chosen. Radix has a real placeholder instead, and
 * refuses an item with an empty value outright (the empty string is what
 * *clears* a Radix select), so that entry is dropped here and its label
 * becomes the placeholder — the merchant's own word for "not chosen yet",
 * not one written in the frontend.
 *
 * `voice` follows the Mono-Is-Data rule: a month or a year is a figure and
 * sets in mono, a country or a state is a name and sets in caps.
 */
export function SelectField({
  field,
  value,
  onChange,
  error,
  voice = "label",
}: {
  field: IFormFieldData;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  voice?: "label" | "data";
}) {
  const message = error || field.error;
  const errorId = `${field.name}-error`;
  const placeholder = field.options.find((option) => option.value === "");
  const options = field.options.filter((option) => option.value !== "");
  const optionVoice = voice === "data" ? "meta-caps" : "label-caps";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={field.name} className="label-caps">
        {field.label}
        {field.mandatory && (
          <span className="text-muted-foreground" aria-hidden>
            {" *"}
          </span>
        )}
      </label>
      <Select
        // Radix treats "" as "nothing chosen", which is exactly what an
        // unfilled field is — so an empty value needs no special case.
        value={value}
        onValueChange={onChange}
        name={field.name}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className={cn("h-11 w-full", optionVoice)}
        >
          <SelectValue placeholder={placeholder?.label || "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.id || option.value}
              value={option.value}
              className={optionVoice}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message && (
        <span id={errorId} role="alert" className="text-sm text-destructive">
          {message}
        </span>
      )}
    </div>
  );
}
