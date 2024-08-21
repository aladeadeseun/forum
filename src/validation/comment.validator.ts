import { Types } from "mongoose"
import { z } from "zod"

import CommentImageService from "../services/comment-image.service"
import ThreadService from "../services/thread.service"
import { CreateCommentInputType, ValdationErrorObject } from "../types"
import { parseOneStringToMongoDBObject, validateMongoDbId } from "../util/utility"

const CategorySchema = z.object({
  content:z.optional(z.string().max(4000)),
  threadId:z.string({
    invalid_type_error:'Thread category must be a string',
    required_error:"Thread category is required.",
  }).min(20),
  commentImageID:z.optional(z.string().array())
})

export async function validateComment(threadService: ThreadService, commentImgService: CommentImageService, input: CreateCommentInputType){
  //validate user input using zod
  const valResult =  CategorySchema.safeParse(input)
  //
  let errors: ValdationErrorObject<CreateCommentInputType> = {} as ValdationErrorObject<CreateCommentInputType>

  //if validation is not successful
  if(!valResult.success){
    errors = valResult.error.flatten().fieldErrors
  }
  
  //if the category ID is supplied, check if the category exist in mongodb
  if(!errors.threadId){
    
    //check if the id supplied is a valid mongo db id
    const validId = validateMongoDbId(input.threadId)
    //if string it's invalid mongodb id
    if(typeof(validId) === "string"){
      //set as error
      errors.threadId = [validId]
    }
    //check if its a valid id that exists in mongodb
    else if(!await threadService.threadExists(input.threadId)){
      errors.threadId = ["Category not found."]
    }
  }//end if

  //if the comment image does not have error and image was supplied
  if(input.commentImageID && !errors.commentImageID && input.commentImageID.length > 0){
    
    //store the error
    const imageIdErrors: string[] = []
    //store the image id so I can check db if the image is already uploaded
    const imageIdArray: Types.ObjectId[] = []
    
    //validate the image to ensure its a valid mongo db id
    for(const imageId of input.commentImageID){

      if(typeof(validateMongoDbId(imageId)) === "string"){
        imageIdErrors.push(`Invalid image ID '${imageId}'.`)
      }//end if
      else{
        imageIdArray.push(parseOneStringToMongoDBObject(imageId))
      }
    }//end for loop

    //if error in image id
    if(imageIdErrors.length > 0){
      errors.commentImageID = imageIdErrors
    }else{
      const commentImageExistArray = await commentImgService.checkIfCommentImageExist(imageIdArray)
      
      //validate to ensure image id exist in db 
      if(Array.isArray(commentImageExistArray)){
        errors.commentImageID = commentImageExistArray
      }
    }//end else
  }//end if
  return Object.keys(errors).length > 0 ? errors : false
}