import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { Comment } from "./comment.schema";

export class LikeComment extends TimeStamps{
  
  public readonly _id!: Types.ObjectId

  @prop({type: Types.ObjectId,index:1})
  likes!:Types.ObjectId[]

  @prop({type: Types.ObjectId, ref: Comment.name, index:1})
  comment!:Comment | Types.ObjectId
}

const LikeCommentModel = getModelForClass<typeof LikeComment>(LikeComment);
export default LikeCommentModel;