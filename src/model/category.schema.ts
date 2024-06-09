import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";


export class Category extends TimeStamps{
  public readonly _id!: Types.ObjectId

  @prop({
    required: true,
    trim: true,
    uppercase: true,
    index: true,
    sparse: true,
  })
  name!:string

  @prop()
  deletedAt!:Date | null
}

export default getModelForClass<typeof Category>(Category);
