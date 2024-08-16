import { Types } from 'mongoose';
import { v4 } from 'uuid';
import { ErrorResponseType } from '../types';

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

export function validateMongoDbId(_id: string): Types.ObjectId | string{
  if(Types.ObjectId.isValid(_id)) {
    return new Types.ObjectId(_id)
  }

  return `Invalid id "${_id}"`
}