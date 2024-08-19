import { Types } from "mongoose";
import { Category } from "../../model/category.schema";
import { CommentImage } from "../../model/comment-image.schema";
import { Comment } from "../../model/comment.schema";
import { Thread } from "../../model/thread.schema";
import { User } from "../../model/user.schema";
import { Pagination } from "../../types";
import { Context } from "../../util/context";

export default {
  Thread:{
    category({category}:Thread, _args:any, {categoryService}: Context){
      //if the category is an instance of category object return it
      if(category instanceof Category) return category
      return categoryService.loadCategoryById(category.toHexString())
    },
    comments({_id, comments}:Thread & {comments?: Comment[]}, {pagination}:{pagination?:Pagination},{commentService}:Context){
      //if there's comment passed as part of the object return it
      if(comments) return comments
      //get comment for a thread
      return commentService.getCommentByThreadId(_id.toHexString(), pagination)
    }
  },
  Comment:{
    thread({thread}:Comment, _arg:any, {threadService}:Context){
      if(thread instanceof Thread) return thread
      else return threadService.loadThreadById(thread.toHexString())
    },

    commentImages({images}:Comment, _arg:any,){
      //
      if(images as CommentImage[]) {
        return images.map((img)=>`/images/show/${img._id.toHexString()}`)
      }
      else {
        return images.map((img)=>`/images/show/${(img as Types.ObjectId).toHexString()}`)
      }
    },
    author({author}:Comment, _arg:any, {userService}:Context){
      if(author instanceof User) return author
      else return userService.loadUserById(author.toHexString())
    }
  },
}