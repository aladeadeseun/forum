import { z } from "zod"

export const CategorySchema = z.object({
  name: z.string({
    invalid_type_error:"Category name must be a string",
    required_error:"Category name is required"
  }).max(50).min(4).trim().toLowerCase(),
})
