import DataLoader from "dataloader";
import mongoose, { ProjectionType, Types } from "mongoose";
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
      await CommentModel.find(filterObject).limit((limit + 1)), 
      limit, afterOrBefore, hasPrevOrNext
    )
  }

  addNewComment(input: CreateNewPostInputType, session?:mongoose.mongo.ClientSession){
    return new CommentModel(input).save({session})
  }

  commentExists(_id:Types.ObjectId, projection:ProjectionType<Comment>){
    return CommentModel.findOne({_id}, projection)
  }

  async fetchOneComment(commentID: string){
    //console.log(commentID)
    validateMongoDbId(commentID, true)
    return CommentModel.findOne({_id:parseOneStringToMongoDBObject(commentID)})
  }

  async hideShowComment(commentId:string){
    //I have already check if the comment exists before in the validation
    const comment = await CommentModel.findByIdAndUpdate(
      commentId, 
      [{$set:{hidden:{$eq:[false,"$hidden"]}}}],
      {new:true}
    )
    if(!comment){
      return "Comment not found."
    }
    
    return comment
  }
}