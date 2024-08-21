import DataLoader from "dataloader";
import mongoose, { Types } from "mongoose";
import ThreadModel, { Thread } from "../model/thread.schema";
import { CreateThreadInputType, FilterThread, PageInfo, Pagination } from "../types";
import GetDataLoaderResolver from "../util/dataloader-resolver";
import { getDataAndPageInfo, getPaginationData, parseOneStringToMongoDBObject, parseStringToMongoDBObject, validateMongoDbId } from "../util/utility";
import CommentImageService from "./comment-image.service";
import CommentService from "./comment.service";

export default class ThreadService{

  private byId: DataLoader<string, Thread | null>

  constructor(){
    this.byId = new DataLoader(async function(keys: readonly string[]){
      
      const listDict = GetDataLoaderResolver.mapListToDictionary<Thread>(await ThreadModel.find({_id:{$in:keys}}))

      return GetDataLoaderResolver.mapDictToList<Thread>(keys, listDict, null)
    })
  }

  loadThreadById(_id: string){
    return this.byId.load(_id)
  }

  async addNewThread(
    commentService:CommentService, 
    commentImgService: CommentImageService,
    author: Types.ObjectId, 
    {categoryId, commentImageID, content, title}:CreateThreadInputType
  ){

    const commentImageIdArray = (commentImageID ? parseStringToMongoDBObject(commentImageID) : [])

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

  async fetchThreads(pagination?:Pagination, filter?:FilterThread): 
  Promise<{data:Thread[], pageInfo:PageInfo}>{
    //get limit, cursor
    const {limit, cursor, afterOrBefore} = getPaginationData(pagination)
    
    const filterObject: Record<any, any> = {}

    //after cursor are thread that are above cursor
    //before cursor are thread that are below cursor
    
    //if this variable is set, then I will set previoous or next to true base on if afterOrBefore value
    let hasPrevOrNext = false

    //if the user sent cursor as part of the parameter
    if(cursor){
      //check if cursor exists in record
      if(await ThreadModel.findOne({_id:cursor}), ['_id']){
        filterObject._id = { [afterOrBefore ? '$gt': '$lt']:cursor }
        //
        hasPrevOrNext = true
      }//end if
    }

    //if filter is set
    if(filter){
      //if category is set
      if(filter.categoryId){
        //validate id and throw error if not a valid object id
        validateMongoDbId(filter.categoryId, true)
        //set filter
        filterObject.category = filter.categoryId
      }

      //if to filter by should be on front page
      if(typeof(filter.shouldBeOnFrontPage) !== "undefined"){
        filterObject.shouldBeOnFrontPage = filter.shouldBeOnFrontPage
      }
    }

    //I am adding 1 to limit so I can determine if there's next page.
    //let data = 

    return getDataAndPageInfo(
      //am fetching 1 more document so I can use it to determine if there's more document.
      await ThreadModel.find(filterObject).limit((limit + 1)).sort({_id:-1}), 
      limit, afterOrBefore, hasPrevOrNext
    )
  }

  async fetchOneThread(threadID:string){
    validateMongoDbId(threadID, true)
    return ThreadModel.findOne({_id:parseOneStringToMongoDBObject(threadID)})
  }
}