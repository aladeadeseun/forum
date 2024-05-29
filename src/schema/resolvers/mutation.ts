import { CreateUserInput, LoginInputType } from "../../types";
import { Context } from "../../util/context";
import { errorResponse, successResponse } from "../../util/utility";
import { UserAuthSchema, UserSchema } from "../../validation/user.validator";

export default {
  async createNewUser(_root: any, {input}:{input:CreateUserInput}, {userService}: Context){
    const valResult =  UserSchema.safeParse(input)

    if(!valResult.success){
      return errorResponse("validation_error", valResult.error.flatten().fieldErrors)
    }

    const [emailExists, usernameExists] = await Promise.all([
      await userService.checkIfEmailAlreadyExists(input.email),
      await userService.checkIfUsernameExist(input.email)
    ])

    const errors: Record<keyof CreateUserInput, string[]> = {} as Record<keyof CreateUserInput, string[]>
    //check if the email already exists
    if(emailExists){
      errors.email = [`User with email of "${input.email}" already exists.`]
    }

    if(usernameExists){
      errors.username = [`User with username of "${input.username}" already exists.`]
    }

    if(Object.keys(errors).length > 0){
      return errorResponse("validation_error", errors)
    }

    if(!valResult.data.short_bio){
      valResult.data.short_bio = "";
    }

    return successResponse(
      "Registration successfully, please verify your email to start posting thread and comment.", 
      (await userService.createCustomer(valResult.data as any)).toJSON()
    )
  },

  async userLogin(_root:any, {input}:{input:LoginInputType}, {userService, sessionService, userAuthReq}:Context){
    
    const valResult = UserAuthSchema.safeParse(input)

    if(!valResult.success){
      return errorResponse("login_error")
    }

    const user = await userService.authenticate(input, sessionService, userAuthReq)

    if(typeof user === "string"){
      return errorResponse(user)
    }

    return successResponse("Login successful", user)
  }
}