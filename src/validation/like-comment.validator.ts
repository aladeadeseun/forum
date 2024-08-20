import CommentService from "../services/comment.service";
import { parseOneStringToMongoDBObject, validateMongoDbId } from "../util/utility";

export async function validateLikeComment(commentId: string, commentService: CommentService){
  if(!commentId) return {commentId:["Comment Id is required."]}
  //check if the id supplied is a valid mongo db id
  const validId = validateMongoDbId(commentId)

  if(validId !== true){
    return {commentId:[validId]}
  }

  if(!await commentService.commentExists(parseOneStringToMongoDBObject(commentId))){
    return {commentId:["Comment not found."]}
  }

  return false
}