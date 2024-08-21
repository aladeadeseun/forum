import DataLoader from "dataloader";
import { Types } from "mongoose";
import CommentLikeModel from "../model/like.schema";
import GetDataLoaderResolver from "../util/dataloader-resolver";
import { parseStringToMongoDBObject } from "../util/utility";

type TotalCommentLikeAggregates = {totalLikes:number,_id:Types.ObjectId}

export default class LikeCommentService{

  private getTotalLikeByCommentId: DataLoader<string, TotalCommentLikeAggregates | null>

  constructor(){
    this.getTotalLikeByCommentId = new DataLoader(async function(keys: readonly string[]){
      //console.log(keys)
      //calculate the total number of likes and return to caller
      //calculate the total number of likes and return to caller
      const totalLikesAggregate = await CommentLikeModel.aggregate([
        {$match:{comment:{$in:parseStringToMongoDBObject(keys as string[])}}},
        {$project:{totalLikes:1, comment:1, likes:1}},
        {$unwind:'$likes'},
        {$group:{
          _id:"$comment", 
          totalLikes:{$sum:1}
        }}
      ]) as TotalCommentLikeAggregates[]

      console.log(totalLikesAggregate)

      return GetDataLoaderResolver.mapDictToList<TotalCommentLikeAggregates>(
        keys,
        GetDataLoaderResolver.mapListToDictionary<TotalCommentLikeAggregates>(totalLikesAggregate),
        null
      )
    })
  }

  loadTotalLikeByCommentId(_id: string){
    return this.getTotalLikeByCommentId.load(_id)
  }

  async toggleLikes(comment: Types.ObjectId, userId: Types.ObjectId){
    //const commentLike = await CommentLikeModel.findOne()
    //const likes = await CommentLikeModel.findOneAndUpdate({comment}, {$inc:{userLikes:[user]}}, {upsert:true, new:true})
    //console.log(likes)

    //check if like exists before
    const likeExists = await CommentLikeModel.findOne(
      {$and:[{comment}, {likes:{$elemMatch:{$eq:userId}}}]}, ["_id"]
    )

    //if exists pull it
    if(likeExists){
      await CommentLikeModel.updateOne({comment}, {$pull:{likes:userId}})
    }
    //insert
    else{
      //insert if exists or create it not exist
      await CommentLikeModel.updateOne({comment}, {$addToSet:{likes:userId}}, {upsert:true})
    }

    //initial total likes to 0
    let totalLikes = 0

    //calculate the total number of likes and return to caller
    const totalLikesAggregate = await CommentLikeModel.aggregate([
      {$match:{comment}},
      {$project:{totalLikes:1, comment:1, likes:1}},
      {$unwind:'$likes'},
      {$group:{
        _id:"$comment", 
        totalLikes:{$sum:1}
      }}
    ]) as TotalCommentLikeAggregates[]

    console.log(totalLikesAggregate)

    if(totalLikesAggregate.length > 0){
      totalLikes = totalLikesAggregate[0].totalLikes
    }

    return totalLikes
  }
  
}