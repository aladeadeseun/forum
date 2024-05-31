import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { User } from "./user.schema";

export class Otp extends TimeStamps{
  public readonly _id!: Types.ObjectId

  @prop({type: Types.ObjectId, ref: User.name})
  user!:User | Types.ObjectId

  @prop({required:true})
  timestamp!:number

  @prop({required:true})
  pin!:string

  //I want to ensure that client cannot not regenerate otp token more than 3 times
  //if the generation is more than 3 times, client we have to wait for 1 hours before they can generate new one
  @prop({max:4, required:true, min:1})
  genCounter!:number

  //this is the time that client start regenerating timestamp
  @prop({required: true})
  counterTimestamp!:number

  @prop({required: true, default:false})
  used!:boolean
}

const OtpModel = getModelForClass<typeof Otp>(Otp);
export default OtpModel;
