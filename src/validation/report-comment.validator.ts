import { Types } from "mongoose";
import CommentService from "../services/comment.service";
import { parseOneStringToMongoDBObject, validateMongoDbId } from "../util/utility";

export async function validateReportComment(commentId: string, commentService: CommentService){
 
  if(!commentId) {
    //return {success:false, errors:{commentId:["Comment Id is required."]}}
    return {commentId:["Comment Id is required."]}
  }
  //check if the id supplied is a valid mongo db id
  const validId = validateMongoDbId(commentId)

  if(validId !== true){
    return {commentId:[validId]}
  }

  const comment = await commentService.commentExists(
    parseOneStringToMongoDBObject(commentId), {"hidden":1}
  )

  if(!comment){
    return {commentId:["Comment not found."]}
  }

  if(comment.hidden){
    return {commentId:["Comment already hidden."]}
  }
  
  return false
}