import { z } from "zod"

export const PinSchema = z.object({
  pin: z.string().min(4).max(4).trim(),
})
