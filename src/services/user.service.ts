import argon2 from "argon2";
import { ObjectId } from "mongoose";
import UserModel, { User } from "../model/user.schema";

import getConfig from "../config";
import { CreateUserInput, ErrorResponseType, HelpExtractFromObject, LoginInputType } from "../types";

const saltRounds = getConfig("SALT_ROUND")

export default class UserService{
  async createCustomer({password, email, username, shortBio}: CreateUserInput){

    console.log({username})

    return UserModel.create({
      email, password: await argon2.hash(password, {hashLength:saltRounds}),
      shortBio:shortBio, username
    })
  }

  async checkIfEmailAlreadyExists(
    email: User['email']
  ): Promise<boolean>{
    return !!(await UserModel.findOne({email}))
  }

  async checkIfUsernameExist(
    username: User['username']
  ): Promise<boolean>{
    return !!(await UserModel.findOne({username}))
  }

  async authenticate(
    {usernameOrEmail, password}:LoginInputType
  ): Promise<ErrorResponseType | HelpExtractFromObject<User, Exclude<keyof User, "password">>>{
    //get user if exist
    const user = await UserModel.findOne({$or:[{email:usernameOrEmail}, {username:usernameOrEmail}]}).select([
      "password", "email", "shortBio", "avatar", "createdAt",
      "role", "isEmailVerified", "active", "updatedAt", "username"
    ])

    //console.log(user)

    //if the user with the email does not exists, return false
    if(!user) return "login_error"
    //check if user has been banned
    if(!user.active) return "account_banned"

    //compare(password, user.password)
    //check if the password is correct
    if(!(await argon2.verify(user.password, password))) return "login_error"

    return user.toObject()
  }

  getCurrentUser(sub:ObjectId){
    return UserModel.findById(sub);
  }
}