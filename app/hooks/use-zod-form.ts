import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import type { ServerFormDefinition } from "@/types/form"
import { createZodSchema, extractDefaultValues } from "@/lib/form-utils"


interface UseZodFormOptions {
  excludeFields?: string[]
  includeFields?: string[]
}

export function useZodForm(serverForm: ServerFormDefinition, options: UseZodFormOptions = {}) {
  // Create Zod schema from server form definition
  const zodSchema = createZodSchema(serverForm, options)

  // Extract default values from form definition
  const defaultValues = extractDefaultValues(serverForm, options)

  // Create form with React Hook Form
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
    defaultValues,
  })

  return {
    form,
    zodSchema,
    serverForm,
  }
}

