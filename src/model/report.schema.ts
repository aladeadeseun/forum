import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { Comment } from "./comment.schema";


export class ReportedComment extends TimeStamps{
  
  public readonly _id!: Types.ObjectId

  @prop({type: Types.ObjectId})
  reports!:Types.ObjectId[]

  @prop({type: Types.ObjectId, ref: Comment.name, index:1})
  comment!:Comment | Types.ObjectId
}

const ReportedCommentModel = getModelForClass<typeof ReportedComment>(ReportedComment);
export default ReportedCommentModel;