import { FilterThread, Pagination } from "../../types"
import { Context } from "../../util/context"

export default {
  hello(){
    return "Hello World"
  },
  self(_root:any, _arg:any, {userAuthReq}:Context){
    return userAuthReq.user
  },
  categories(_root:any, _arg:any, {categoryService}:Context){
    return categoryService.read()
  },
  threads(_root:any, {pagination, filter}:{pagination?:Pagination, filter?:FilterThread}, {threadService}:Context){
    return threadService.fetchThreads(pagination, filter)
  }
}