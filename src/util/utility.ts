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

export function errorResponse(which: ErrorResponseType, validationError?: any){

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
    
    default:
      msg = "Internal server error, please try again later."
    break;
  }

  return { success:false, msg, error:validationError, data:null }
}

export function successResponse<T>(msg: string, data: T | null){
  return { success:true, msg, error:null, data }
}