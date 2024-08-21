import DataLoader from "dataloader";
import mongoose, { isValidObjectId, Types } from "mongoose";
import CommentModel, { Comment } from "../model/comment.schema";
import { CreateNewPostInputType, FilterComment, Pagination } from "../types";
import GetDataLoaderResolver from "../util/dataloader-resolver";
import { getDataAndPageInfo, getPaginationData, parseOneStringToMongoDBObject, validateMongoDbId } from "../util/utility";

/**
 * const listDict = GetDataLoaderResolver.mapListToDictionary<Category>(await CategoryModel.find({_id:{$in:keys}}))
 * return GetDataLoaderResolver.mapDictToList<Category>(keys, listDict, null)
 */

export default class CommentService{

  private byId: DataLoader<string, Comment | null>

  constructor(){
    this.byId = new DataLoader(async function(keys: readonly string[]){
      
      const listDict = GetDataLoaderResolver.mapListToDictionary<Comment>(await CommentModel.find({_id:{$in:keys}}))

      return GetDataLoaderResolver.mapDictToList<Comment>(keys, listDict, null)
    })
  }

  loadCommentById(_id: string){
    return this.byId.load(_id)
  }

  async filterComment(filter?:FilterComment, pagination?:Pagination){

    const {limit, cursor, afterOrBefore} = getPaginationData(pagination)
    
    const filterObject: Record<any, any> = {}

    if(filter){
      if(filter.thread){
        if(typeof filter.thread === "string"){
          validateMongoDbId(filter.thread, true)
          filterObject.thread = parseOneStringToMongoDBObject(filter.thread)
        }else{
          filterObject.thread = filter.thread
        }
      }

      if(filter.author){
        validateMongoDbId(filter.author, true)
        filterObject.author = parseOneStringToMongoDBObject(filter.author)
      }
    }

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

  async commentExists(_id:Types.ObjectId){
    return !!(await CommentModel.findOne({_id}, "_id"))
  }
}