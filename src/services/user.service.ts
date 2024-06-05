import argon2 from "argon2";
import { ObjectId, Types } from "mongoose";
import UserModel, { User } from "../model/user.schema";

import getConfig from "../config";
import { CreateUserInput, ErrorResponseType, HelpExtractFromObject, LoginInputType } from "../types";
import { Context } from "../util/context";
import SessionService from "./session.service";

const saltRounds = getConfig("SALT_ROUND")

export default class UserService{
  async createCustomer({password, email, username, shortBio}: CreateUserInput){

    return UserModel.create({
      email, password: await argon2.hash(password, {hashLength:saltRounds}),
      shortBio:shortBio, username
    })
  }

  async updateUser(userId: Types.ObjectId, update:{[K in keyof User]?:User[K]}){
    return UserModel.findOneAndUpdate({_id:userId}, {$set:update})
  }

  async checkIfEmailAlreadyExists(
    email: User['email']
  ): Promise<boolean>{
    return !!(await UserModel.findOne({email}), ["_id"])
  }

  async checkIfUsernameExist(
    username: User['username']
  ): Promise<boolean>{
    return !!(await UserModel.findOne({username}, ["_id"]))
  }

  async authenticate(
    {usernameOrEmail, password, keepMeLoggedIn}:LoginInputType,
    sessionService: SessionService,
    userAuthReq:Context['userAuthReq']
  ): Promise<ErrorResponseType | HelpExtractFromObject<User, Exclude<keyof User, "password">>>{
    //get user if exist
    const user = await UserModel.findOne({$or:[{email:usernameOrEmail}, {username:usernameOrEmail}]}).select([
      "password", "email", "shortBio", "avatar", "createdAt",
      "role", "isEmailVerified", "active", "updatedAt", "username"
    ])

    //if the user with the email does not exists, return false
    if(!user) return "login_error"
    //check if user has been banned
    if(!user.active) return "account_banned"

    //compare(password, user.password)
    //check if the password is correct
    if(!(await argon2.verify(user.password, password))) return "login_error"

    //generate token
    const {exp, csrf, jwt} = await sessionService.generateToken(user._id.toHexString(),keepMeLoggedIn)
    //set value
    userAuthReq.exp = exp
    userAuthReq.csrf = csrf
    userAuthReq.token = jwt
    userAuthReq.hasNewToken = true

    return user.toObject()
  }

  getCurrentUser(sub:ObjectId){
    return UserModel.findById(sub);
  }
}