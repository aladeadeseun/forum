import { Types } from "mongoose";
import CommentService from "../services/comment.service";
import { parseOneStringToMongoDBObject, validateMongoDbId } from "../util/utility";

export async function validateReportComment(commentId: string, commentService: CommentService){
 
  if(!commentId) {
    //return {success:false, errors:{commentId:["Comment Id is required."]}}
    return "Comment Id is required."
  }
  //check if the id supplied is a valid mongo db id
  const validId = validateMongoDbId(commentId)

  if(validId !== true){
    return validId
  }

  const comment = await commentService.commentExists(
    parseOneStringToMongoDBObject(commentId), {"hidden":1}
  )

  if(!comment){
    return "Comment not found."
  }

  if(comment.hidden){
    return "Comment already hidden."
  }
  
  return false
}