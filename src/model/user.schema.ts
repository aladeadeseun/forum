import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { RoleType } from "../types";

export class User extends TimeStamps{
  
  public readonly _id!: Types.ObjectId

  @prop({default:true})
  public active:boolean = true

  @prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    sparse: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
  })
  public email!: string;

  @prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    sparse: true,
  })
  public username!:string

  @prop({default:""})
  public shortBio: string = ""

  @prop({default:"avatar.png"})
  public avatar: string = "avatar.png"

  @prop({type:String, default:RoleType.MEMBER, enum:RoleType})
  public role:RoleType=RoleType.MEMBER

  @prop({ default: false })
  public isEmailVerified: boolean= false;

  @prop({ select: false })
  password!: string;
}

const UserModel = getModelForClass<typeof User>(User);
export default UserModel;
