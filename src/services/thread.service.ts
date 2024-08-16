import mongoose, { Types } from "mongoose";
import ThreadModel from "../model/thread.schema";
import { CreateThreadInputType } from "../types";
import CommentService from "./comment.service";

export default class ThreadService{

  async addNewThread(commentService:CommentService, author: Types.ObjectId, {categoryId, commentImageID, content, title}:CreateThreadInputType){
    const session = await mongoose.startSession()
    
    session.startTransaction()

    try{
      const thread = await new ThreadModel({title, category:categoryId}).save({session})
      const comment = await commentService.addNewComment({
        isFirst:true, 
        author, body:content, 
        thread:thread._id, 
        images:commentImageID.map(i=>new Types.ObjectId(i))
      })
      await session.commitTransaction()

      return {thread:thread.toObject(), comment:comment.toObject()}
    }
    catch(e){
      await session.abortTransaction()
      throw e
    }
    finally{
      await session.endSession()
    }
  }
}