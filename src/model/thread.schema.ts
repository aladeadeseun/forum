import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { Category } from "./category.schema";

export class Thread extends TimeStamps{
  
  public readonly _id!: Types.ObjectId

  @prop({default:false})
  public locked!:boolean

  @prop({default:false})
  public shouldBeOnFrontPage:boolean=false

  @prop({
    required: true,
    trim: true,
  })
  public title!: string;

  @prop({type: Types.ObjectId, ref: Category.name})
  category!:Category | Types.ObjectId
}

const ThreadModel = getModelForClass<typeof Thread>(Thread);
export default ThreadModel;