import mongoose from "mongoose";
import CommentModel from "../model/comment.schema";
import { CreateNewPostInputType } from "../types";


export default class CommentService{
  addNewComment(input: CreateNewPostInputType, session?:mongoose.mongo.ClientSession){
    return new CommentModel(input).save({session})
  }
}