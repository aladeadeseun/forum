import { JwtPayload } from "jsonwebtoken"
import { Category } from "../model/category.schema"
import { User } from "../model/user.schema"

export enum RoleType {
  ADMIN="admin",
  MODERATOR="moderator",
  MEMBER="member",
  GUEST="guest",
  REVIEWER="reviewer"
}

export type ErrorResponseType = 
  "validation_error" 
  | "login_error" 
  | "account_banned" 
  | "invalid_csrf" 
  | "auth_error"
  | "email_verification_error"
  | "email_already_verified"
  | "permission_error"
  

export type JwtPayloadWithCsrfToken = JwtPayload & { csrf:string, kp:boolean }

export interface UserAuthRequest {
  user : User | null, 
  msg:string,
  token:string,
  csrf:string,
  keepMeLoggedIn:boolean,
  exp:number,
  hasNewToken:boolean, 
  clientCsrf:string
};

export type LoginInputType = {
  password: User['password'],
  usernameOrEmail: string,
  keepMeLoggedIn:boolean
  
}

export type HelpExtractFromObject<T extends {}, U extends keyof T> = {
  [K in U]: T[K]
}

export type CreateUserInput = (
  HelpExtractFromObject<User, "email" | "username" | "password" | "shortBio"> 
  & {cfmPsd:string}
)

export type PayslipAttachments = {filename:string, content:Buffer}

export type GetEmailAsStringOrArray = "string" | "array"

export type CreateCategoryInput = HelpExtractFromObject<Category, "name">

export type CategoryIdObjectType = {categoryId:string}