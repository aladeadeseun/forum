import { validateMongoDbId } from "../util/utility";

export async function validateHideShowComment(commentId: string){
 
  if(!commentId) {
    return "Thread Id is required."
  }
  //check if the id supplied is a valid mongo db id
  const validId = validateMongoDbId(commentId)

  if(validId !== true){
    return validId
  }

  return false
}