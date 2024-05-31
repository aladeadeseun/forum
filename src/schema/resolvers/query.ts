import { Context } from "../../util/context"

export default {
  hello(){
    return "Hello World"
  },
  self(_root:any, _arg:any, {userAuthReq}:Context){
    return userAuthReq.user
  }
}