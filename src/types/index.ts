import { JwtPayload } from "jsonwebtoken"
import { User } from "../model/user.schema"

export enum RoleType {
  ADMIN="admin",
  MODERATOR="moderator",
  MEMBER="member",
  //GUEST="guest"
}

export type ErrorResponseType = "validation_error" | "login_error" | "account_banned"

export type JwtPayloadWithCsrfToken = JwtPayload & { csrf:string, kp:boolean }

export interface UserAuthRequest {
  user : User | null, 
  msg:string,
  token:string,
  csrf:string,
  keepMeLoggedIn:boolean,
  exp:number,
  hasNewToken:boolean
};

export type LoginInputType = {
  password: User['password'],
  usernameOrEmail: string
}

export type HelpExtractFromObject<T extends {}, U extends keyof T> = {
  [K in U]: T[K]
}

  export type CreateUserInput = HelpExtractFromObject<User, "email" | "username" | "password" | "shortBio"> & {cfmPsd:string}