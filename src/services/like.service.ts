import DataLoader from "dataloader";
import { Types } from "mongoose";
import CommentLikeModel from "../model/like.schema";

export default class LikeCommentService{

  private getTotalLikeByCommentId: DataLoader<string, number>

  constructor(){
    this.getTotalLikeByCommentId = new DataLoader(async function(keys: readonly string[]){
      console.log(keys)
      return Promise.resolve([0])
    })
  }

  loadTotalLikeByCommentId(_id: string){
    return this.getTotalLikeByCommentId.load(_id)
  }

  async toggleLikes(comment: Types.ObjectId, userId: Types.ObjectId){
    //const commentLike = await CommentLikeModel.findOne()
    //const likes = await CommentLikeModel.findOneAndUpdate({comment}, {$inc:{userLikes:[user]}}, {upsert:true, new:true})
    //console.log(likes)

    //console.log()
    const likeExists = await CommentLikeModel.findOne(
      {$and:[{comment}, {likes:{$elemMatch:{$eq:userId}}}]}, ["_id"]
    )

    //if exists pull it
    if(likeExists){
      console.log("pulling")
      await CommentLikeModel.updateOne({comment}, {$pull:{likes:userId}})
    }
    //insert
    else{
      console.log("adding to set")
      await CommentLikeModel.updateOne({comment}, {$addToSet:{likes:userId}}, {upsert:true})
    }

    // console.log(
    //   await CommentLikeModel.aggregate([
    //     {$match:{comment}},
    //     {$project:{likes:1}},
    //     {$unwind:'$likes'},
    //     {$group:{
    //       _id:{like:'$likes'}, $count:"_id"
    //     }}
    //   ])
    // )

    return {
      comment,
      totalLikes: 0
    }
  }
  
}