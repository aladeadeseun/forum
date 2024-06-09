import { z } from "zod"

export const UserSchema = z.object({
  
  email: z.string({
    invalid_type_error:"Email must be a string",
    required_error:"Email is required"
  }).min(6).max(50).email().trim().toLowerCase(),

  password: z.string({
    invalid_type_error:"Password must contain atleast one special character, number",
    required_error:"Password is required"
  }).min(
    6, "Minimum password length is 6"
  ).max(
    30, "Maximum password length is 30"
  ).toLowerCase(),

  cfmPsd: z.string().toLowerCase(),

  shortBio:z.string().min(1).max(50).optional(),

  username:z.string().min(3).max(50)
  
}).refine((data) => data.password === data.cfmPsd, {
  message: "Passwords don't match",
  path: ["cfmPsd"], // path of error
})

export const UserAuthSchema = z.object({
  usernameOrEmail: z.string().min(3).max(50).trim().toLowerCase(),
  password: z.string().min(6).max(30).toLowerCase(),
})