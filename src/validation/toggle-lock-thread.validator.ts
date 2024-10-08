import { validateMongoDbId } from "../util/utility";

export async function validateToggleLockThread(threadId: string){
 
  if(!threadId) {
    
    return "Thread Id is required."
  }
  //check if the id supplied is a valid mongo db id
  const validId = validateMongoDbId(threadId)

  if(validId !== true){
    return validId
  }

  return false
}