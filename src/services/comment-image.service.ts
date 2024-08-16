import { ProjectionType, Types } from "mongoose";
import getConfig from "../config";
import CommentImageModel, { CommentImage } from "../model/comment-image.schema";
import { CreateCommentImageInput } from "../types";


const saveCommentImageExpiry = getConfig("SAVE_COMMENT_IMAGE_EXPIRY")

export default class CommentImageService{
  async create({content, mimeType}: CreateCommentImageInput){
    //get current time in seconds
    const nowInSecs = Math.floor(Date.now() / 1000)

    //get comment image if not saved i.e after uploading the client didn't save the comment
    //I want to reuse so i won't have junk in DB
    const commentImage = await CommentImageModel.findOne({
      $and:[
        //Am using to prevent garbage in case the user decided not save comment after upload
        {saveUploadTimestamp:{$lte:nowInSecs}}, 
        //this will be false if client didn't save the image after upload
        {savedWithComment:false}
      ]
    }).limit(1)

    //I need to ensure the image is not overwritten when uploading multiple file
    const saveUploadTimestamp = (nowInSecs + saveCommentImageExpiry)
    //if doesn't exist
    if(!commentImage){
      //create new one
      return CommentImageModel.create({content, saveUploadTimestamp,mimeType})
    }
    //update previous one
    commentImage.content = content
    commentImage.mimeType = mimeType
    //ensure the image is not overwritten when client is uploading multiple file
    commentImage.saveUploadTimestamp = saveUploadTimestamp
    //save in db
    return commentImage.save()
  }

  getCommentImage(){
    return CommentImageModel.find()
  }

  getOneCommentImage(_id:string | Types.ObjectId, select:ProjectionType<CommentImage> | null | undefined){
    if(_id instanceof Types.ObjectId)
      return CommentImageModel.findOne({_id}, select).limit(1)
    else if(typeof _id === "string")
      return CommentImageModel.findById(_id, select).limit(1)

    throw new Error(`Unknow ${_id}`)
  }

  async checkIfCommentImageExist(commentImageIdArray: Types.ObjectId[]): Promise<false | string[]>{
    const commentImageIDAsString: string[] = []

    for(const commentImageID of commentImageIdArray){
      commentImageIDAsString.push(commentImageID.toHexString())
    }

    const commentImageError: string[] = []

    let currentImageIdAsString : string = ''

    for (const commentImage of  (await CommentImageModel.find({"_id":{$in:commentImageIdArray}}, ["_id"]))){

      currentImageIdAsString = commentImage._id.toHexString()

      if(commentImageIDAsString.indexOf(currentImageIdAsString) < 0){
        commentImageError.push(`Image with Id of '${currentImageIdAsString}' not found`)
      }//end if
    }//end for loop

    return commentImageError.length > 0 ? commentImageError : false

  }//end function
}