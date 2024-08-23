import { Types } from "mongoose";
import ThreadService from "../services/thread.service";
import { validateMongoDbId } from "../util/utility";

export async function validateToggleLockThread(threadId: string){
 
  if(!threadId) {
    
    return {threadId:["Thread Id is required."]}
  }
  //check if the id supplied is a valid mongo db id
  const validId = validateMongoDbId(threadId)

  if(validId !== true){
    return {threadId:[validId]}
  }

  return false
}