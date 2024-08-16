import { Ref, getModelForClass, prop, } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { CommentImage } from "./comment-image.schema";
import { Thread } from "./thread.schema";
import { User } from "./user.schema";

export class Comment extends TimeStamps{
  
  public readonly _id!: Types.ObjectId

  @prop({default:false})
  public hidden!:boolean

  @prop({default:false})
  public isFirst!:boolean

  @prop({
    trim: true, default:""
  })
  public body!: string;

  @prop({type: Types.ObjectId, ref: Thread.name})
  thread!:Thread | Types.ObjectId

  @prop({type: Types.ObjectId, ref: User.name})
  author!:User | Types.ObjectId

  @prop({type: () => Types.ObjectId, ref: () => CommentImage})
  images!:Ref<CommentImage, Types.ObjectId>[]
}

const CommentModel = getModelForClass<typeof Comment>(Comment);
export default CommentModel;