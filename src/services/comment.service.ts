import mongoose from "mongoose";
import CommentModel, { Comment } from "../model/comment.schema";
import { CreateNewPostInputType, Pagination } from "../types";
import { getDataAndPageInfo, getPaginationData } from "../util/utility";

/**
 * const listDict = GetDataLoaderResolver.mapListToDictionary<Category>(await CategoryModel.find({_id:{$in:keys}}))
 * return GetDataLoaderResolver.mapDictToList<Category>(keys, listDict, null)
 */

export default class CommentService{

  async getCommentByThreadId(threadId: string, pagination?:Pagination){
    const {limit, cursor, afterOrBefore} = getPaginationData(pagination)
    
    const filterObject: Record<any, any> = {thread:threadId}

    //after cursor are thread that are above cursor
    //before cursor are thread that are below cursor
    
    //if this variable is set, then I will set previoous or next to true base on if afterOrBefore value
    let hasPrevOrNext = false

    //if the user sent cursor as part of the parameter
    if(cursor){
      //check if cursor exists in record
      if(await CommentModel.findOne({_id:cursor}), ['_id']){
        filterObject._id = { [afterOrBefore ? '$gt': '$lt']:cursor }
        //
        hasPrevOrNext = true
      }//end if
    }

    //I am adding 1 to limit so I can determine if there's next page.
    //let data = 

    return getDataAndPageInfo(
      //am fetching 1 more document so I can use it to determine if there's more document.
      await CommentModel.find(filterObject).limit((limit + 1)).sort({_id:-1}), 
      limit, afterOrBefore, hasPrevOrNext
    )
  }

  addNewComment(input: CreateNewPostInputType, session?:mongoose.mongo.ClientSession){
    return new CommentModel(input).save({session})
  }
}