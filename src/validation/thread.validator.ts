import { Types } from "mongoose"
import { z } from "zod"
import CategoryService from "../services/category.service"
import CommentImageService from "../services/comment-image.service"
import { CreateThreadInputType } from "../types"
import { parseOneStringToMongoDBObject, validateMongoDbId } from "../util/utility"

type ValdationErrorObject = {[K in keyof CreateThreadInputType]?:string[]}

const CategorySchema = z.object({
  title: z.string({
    invalid_type_error:"Thread title must be a string",
    required_error:"Thread title is required.",
    message:"Title",
    description:"This is a description"
  }).max(150).min(5).trim(),
  content:z.optional(z.string().max(4000)),
  categoryId:z.string({
    invalid_type_error:'Thread category must be a string',
    required_error:"Thread category is required.",
  }),
  commentImageID:z.string().array()
})

export async function validate(catService: CategoryService, commentImgService: CommentImageService, input: CreateThreadInputType){
  //validate user input using zod
  const valResult =  CategorySchema.safeParse(input)
  //
  let errors: ValdationErrorObject = {} as ValdationErrorObject

  //if validation is not successful
  if(!valResult.success){
    errors = valResult.error.flatten().fieldErrors
  }

  //if the category ID is supplied, check if the category exist in mongodb
  if(!errors.categoryId){
    //check if the id supplied is a valid mongo db id
    const validId = validateMongoDbId(input.categoryId)
    //if string it's invalid mongodb id
    if(typeof(validId) === "string"){
      //set as error
      errors.categoryId = [validId]
    }
    //check if its a valid id that exists in mongodb
    else if(!await catService.categoryExists(parseOneStringToMongoDBObject(input.categoryId))){
      errors.categoryId = ["Category not found."]
    }
  }//end if

  //if the comment image does not have error and image was supplied
  if(!errors.commentImageID && input.commentImageID.length > 0){
    
    //store the error
    const imageIdErrors: string[] = []
    //store the image id so I can check db if the image is already uploaded
    const imageIdArray: Types.ObjectId[] = []
    
    //validate the image to ensure its a valid mongo db id
    for(const imageId of input.commentImageID){

      if(typeof(validateMongoDbId(input.categoryId)) === "string"){
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
