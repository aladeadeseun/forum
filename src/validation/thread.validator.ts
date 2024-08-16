import { Types } from "mongoose"
import { z } from "zod"
import CategoryService from "../services/category.service"
import CommentImageService from "../services/comment-image.service"
import { CreateThreadInputType } from "../types"
import { errorResponse, validateMongoDbId } from "../util/utility"

type ValdationErrorObject = {[K in keyof CreateThreadInputType]?:string[]}

const CategorySchema = z.object({
  title: z.string({
    invalid_type_error:"Thread title must be a string",
    required_error:"Thread title is required."
  }).max(150).min(5).trim(),
  content:z.optional(z.string().max(4000)),
  categoryId:z.string({
    invalid_type_error:'Thread category must be a string',
    required_error:"Thread category is required.",
  }),
  commentImageID:z.string().array()
})

export async function validate(catService: CategoryService, commentImgService: CommentImageService, input: CreateThreadInputType){
  //validate user input
  const valResult =  CategorySchema.safeParse(input)
  
  let errors: ValdationErrorObject = {} as ValdationErrorObject

  if(!valResult.success){
    errors = valResult.error.flatten().fieldErrors
  }

  if(!errors.categoryId){
    const validId = validateMongoDbId(input.categoryId)

    if(typeof(validId) === "string"){
      errors.categoryId = [validId]
    }
    else if(!await catService.categoryExists(validId)){
      errors.categoryId = ["Category not found."]
    }
  }

  if(!errors.commentImageID){
    
    let validId : string | Types.ObjectId
    const imageIdErrors: string[] = []
    const imageIdArray: Types.ObjectId[] = []

    for(const imageId of input.commentImageID){
      validId = validateMongoDbId(input.categoryId)
      if(typeof(validId) === "string"){
        imageIdErrors.push(`Invalid image ID '${imageId}'.`)
      }//end if
      else{
        imageIdArray.push(validId)
      }
    }//end for loop

    if(imageIdErrors.length > 0){
      errors.commentImageID = imageIdErrors
    }else{
      const commentImageExistArray = await commentImgService.checkIfCommentImageExist(imageIdArray)
      //validate to ensure image id exist in db 
      if(Array.isArray(commentImageExistArray)){
        errors.commentImageID = commentImageExistArray
      }
    }
  }//end if
  return Object.keys(errors).length > 0 ? errors : false
}
