import { Otp } from "../../model/otp.schema";
import { CategoryIdObjectType, CreateCategoryInput, CreateThreadInputType, CreateUserInput, LikeCommentIdObjectType, LoginInputType } from "../../types";
import { Context } from "../../util/context";
import { errorResponse, errorResponseWithMsg, parseOneStringToMongoDBObject, successResponse, validateMongoDbId } from "../../util/utility";
import { CategorySchema } from "../../validation/category.validator";
import { validateLikeComment } from "../../validation/like-comment.validator";
import { PinSchema } from "../../validation/pin.validator";
import { validate } from "../../validation/thread.validator";
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

    if(!valResult.data.shortBio){
      valResult.data.shortBio = "";
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

    //if user already login, return
    if(userAuthReq.user){
      return successResponse("You already logged in", userAuthReq.user)  
    }

    const user = await userService.authenticate(input, sessionService, userAuthReq)

    if(typeof user === "string"){
      return errorResponse(user)
    }

    return successResponse("Login successful", user)
  },

  async sendOtpEmail(_root:any, _arg:any, {userAuthReq, otpService}:Context){
    //, emailService
    //get user
    const user = userAuthReq.user!
    //{userService, sessionService, userAuthReq}:Context
    //check if the email is already verified
    if(user.isEmailVerified){
      return successResponse<string>("Email already verified.", "")
    }
    //create otp
    const result = await otpService.createOtp(user._id)
    if(typeof result === "string"){
      return errorResponseWithMsg(result)
    }

    //send otp message to
    //await emailService.sendEmail(user.email, "Email Verification", getOtpTemplate(user.username, result.pin))

    //send response back to caller
    return successResponse(`Email verification otp sent to ${user.email}. ${result.pin}`);
  },

  async verifyEmail(_root:any, {pin}:{pin:string}, {userAuthReq, otpService, userService}: Context){
    //
    const valResult =  PinSchema.safeParse({pin})

    if(!valResult.success){
      return errorResponse("validation_error", valResult.error.flatten().fieldErrors)
    }
    const user = userAuthReq.user!
    
    const {success, msg} = await otpService.verifyUserEmail(user._id, pin)

    if(success){
      if(await userService.updateUser(user._id, {isEmailVerified:true})){
        return successResponse(msg)
      }//end if
    }//end if
    return errorResponseWithMsg(msg)
  },//end 

  async createCategory(_root:any, input:CreateCategoryInput, {categoryService}: Context){
    const valResult =  CategorySchema.safeParse(input)

    if(!valResult.success){
      return errorResponse("validation_error", valResult.error.flatten().fieldErrors)
    }

    //
    const createCategory = await categoryService.create(input)

    if(createCategory === false){
      return errorResponseWithMsg(`Category with the name of '${input.name}' already exists.`)
    }

    return successResponse("Category created successfully.", createCategory.toObject())
  },

  async updateCategory(_root:any, input: (CreateCategoryInput & CategoryIdObjectType), {categoryService}: Context){
    const valResult =  CategorySchema.safeParse(input)

    if(!valResult.success){
      return errorResponse("validation_error", valResult.error.flatten().fieldErrors)
    }

    const validId = validateMongoDbId(input.categoryId)

    if(typeof validId === "string"){
      return errorResponseWithMsg(validId)
    }

    const updateCatResult = await categoryService.update(input, parseOneStringToMongoDBObject(input.categoryId))

    if(updateCatResult === 1){
      return errorResponseWithMsg("Category not found.")
    }

    if(updateCatResult === false){
      return errorResponseWithMsg(`Category with name of '${input.name}' already exists.`)
    }

    return successResponse("Category successfully updated.", updateCatResult.toObject())
  },

  async deleteCategory(_root:any, {categoryId}:CategoryIdObjectType, {categoryService}: Context){

    const validId = validateMongoDbId(categoryId)

    if(typeof (validId) === "string"){
      return errorResponseWithMsg(validId)
    }

    const deleteCategoryRes = await categoryService.delete(parseOneStringToMongoDBObject(categoryId))

    if(deleteCategoryRes === 1){
      return errorResponseWithMsg("Category not found.")
    }

    return successResponse("Category successfully deleted.", deleteCategoryRes.toObject())
  },

  async createThread(
    _root:any, {input}:{input:CreateThreadInputType}, 
    {categoryService, commentImageService, threadService, commentService, userAuthReq:{user}}: Context
  ){
    //validate user input
    const validationResult = await validate(categoryService, commentImageService, input)
    //if error in user input
    if(validationResult !== false){
      return errorResponse("validation_error", validationResult)
    }
    //return success message
    return successResponse(
      "Thread successfully created.", 
      await threadService.addNewThread(commentService, commentImageService, user!._id, input)
    )
  },

  async likeComment(_root:any, {commentId}:LikeCommentIdObjectType, {likeCommentService, commentService, userAuthReq}: Context){

    const result = await validateLikeComment(commentId, commentService)

    if(result !== false) return errorResponse("validation_error", result)
    
    return successResponse(
      "Request successful.", 
      likeCommentService.toggleLikes(parseOneStringToMongoDBObject(commentId), userAuthReq.user!._id)
    )
  }
}