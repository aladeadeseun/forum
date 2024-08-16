import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

export class CommentImage extends TimeStamps{
  public readonly _id!: Types.ObjectId
  
  @prop({})
  content!:Buffer

  //I need this field to ensure that I can reuse in case client upload but didn't save comment later.
  @prop({default:false})
  savedWithComment!: boolean

  @prop({index:true})
  saveUploadTimestamp!:number

  @prop({})
  mimeType!:string

}

const CommentImageModel = getModelForClass<typeof CommentImage>(CommentImage);
export default CommentImageModel;