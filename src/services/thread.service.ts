import mongoose, { Types } from "mongoose";
import ThreadModel from "../model/thread.schema";
import { CreateThreadInputType } from "../types";
import { parseStringToMongoDBObject } from "../util/utility";
import CommentImageService from "./comment-image.service";
import CommentService from "./comment.service";

export default class ThreadService{

  async addNewThread(
    commentService:CommentService, 
    commentImgService: CommentImageService,
    author: Types.ObjectId, 
    {categoryId, commentImageID, content, title}:CreateThreadInputType
  ){

    const commentImageIdArray = parseStringToMongoDBObject(commentImageID)

    const session = await mongoose.startSession()
    
    session.startTransaction()

    try{
      const thread = await new ThreadModel({title, category:categoryId}).save({session})
      const comment = await commentService.addNewComment({
        isFirst:true, 
        author, body:content, 
        thread:thread._id, 
        images:commentImageIdArray
      })
      await commentImgService.setCommentImageAsSavedWithComment(commentImageIdArray)
      await session.commitTransaction()
      const threadObj: any = thread.toObject()
      threadObj.comments = [comment.toObject()]
      return threadObj
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