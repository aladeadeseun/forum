import { isValidObjectId, Types } from 'mongoose';
import { v4 } from 'uuid';
import getConfig from '../config';
import { ErrorResponseType, Pagination } from '../types';

export function promisify(fn:Function, ...args:any[]) :Promise<any>{
  return new Promise((resolve, reject)=>{
    fn.call(null, ...args, (error:Error, result:any)=>{
      if(error) reject(error);
      else resolve(result);
    })
  });
}

export function getNanoId(){
  return v4();
}

export function getMsg(which: ErrorResponseType){
  let msg

  switch (which) {
    case "validation_error":
      msg = "You have error in your input, make neccessary changes and try again."  
    break;

    case "login_error":
      msg = "Invalid login detail."
    break

    case "account_banned":
      msg = "Your account has been ban."
    break

    case "invalid_csrf":
      msg = "Invalid or missing CSRF token"
    break

    case "auth_error":
      msg = `You must be logged in to access this resource.`
    break

    case "email_verification_error":
      msg = `You need to verify your email to access this resource.`
    break

    case "email_already_verified":
      msg = "Your email is already verified."
    break

    case "permission_error":
      msg = "You do not have permission to access this resource."
    break
    
    default:
      msg = "Internal server error, please try again later."
    break;
  }

  return msg
}

export function errorResponse(which: ErrorResponseType, validationError?: any){
  return { success:false, msg:getMsg(which), error:validationError, data:null }
}

export function errorResponseWithMsg(msg:string, validationError?: any){
  return { success:false, msg, error:validationError, data:null }
}

export function successResponse<T>(msg: string, data?: T | null){
  return { success:true, msg, error:null, data }
}

export function getRandomNumber(min: number, max: number){
  return (min + Math.floor((Math.random() * ((max + 1) - min))))
}

export function validateMongoDbId(_id: string, throwError:boolean=false): true | string{
  if(isValidObjectId(_id)) {
    return true
  }
  
  if(throwError) throw new Error(`Invalid id "${_id}"`)

  return `Invalid id "${_id}"`
}

export function parseOneStringToMongoDBObject(_id: string){
  return new Types.ObjectId(_id)
}

export function parseStringToMongoDBObject(_ids:string[]){
  const _idArray: Types.ObjectId[] = []
  for(const _id of _ids){
    _idArray.push(new Types.ObjectId(_id))
  }
  return _idArray
}

export function getPaginationData(pagination?: Pagination){
  //set limit to defualt limit
  let limit: number = getConfig("FETCH_QUERY_LIMIT")
  //store the pagination cursor
  let cursor: Types.ObjectId | undefined

  let afterOrBefore: boolean = true
  //if pagination
  if(pagination){
    //limit sent from client, use it
    if(pagination.limit) {
      //set limit
      limit = pagination.limit
    }//end if(pagination.limit)

    //if the cursor is set and is valid mongodb 
    if(pagination.cursor && Types.ObjectId.isValid(pagination.cursor)){
      cursor = new Types.ObjectId(pagination.cursor)
    }
    afterOrBefore = pagination.afterOrBefore
  }

  return {limit, cursor, afterOrBefore}
}


export function sleep(sleepTimeInMs: number = 1_000): {promise:Promise<void>, abortSleep:()=>void}{
  //store the timeout id
  let timeoutId:NodeJS.Timeout | undefined = undefined
  //return array of sleep and the abort in case I need to stop the timeout
  return {
    promise:new Promise((resolve:Function)=>{
      timeoutId = setTimeout(()=>{
        resolve()
      }, sleepTimeInMs)
    }),
    abortSleep:function abortSleep(){
      if(timeoutId) {
        clearTimeout(timeoutId)
        timeoutId =undefined
      }
    }
  }
}

export function getDataAndPageInfo<T extends { _id:Types.ObjectId }>(
  data:T[], limit: number, afterOrBefore:boolean, hasPrevOrNext: boolean
){
  
  let hasPrev = false, hasNext = false, hasMore = data.length > limit

  if(afterOrBefore){
    hasPrev = hasPrevOrNext
    hasNext = hasMore
  }else{
    hasPrev = hasMore
    hasNext = hasPrevOrNext
  }

  data = (hasMore ? data.slice(0, limit) : data)

  let endCursor, startCursor

  if(data.length > 0){
    startCursor = data[0]._id.toHexString()
    endCursor = data[(data.length - 1)]._id.toHexString()
  }

  return { 
    data, 
    pageInfo:{ hasNext, hasPrev, endCursor, startCursor } 
  }
}