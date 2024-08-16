import JsonWebToken from "jsonwebtoken";

import getConfig from "../config";
import { JwtPayloadWithCsrfToken } from "../types";
import { getNanoId, promisify } from "../util/utility";

type TokenError = "TokenExpiredError" | "JsonWebTokenError" | "NotBeforeError";

type TokenPayloadResult = {payload:JwtPayloadWithCsrfToken | null, msg:string};

const sessionSecretToken = getConfig("SESS_SECRET_TOKEN")
const sessName = getConfig("SESS_NAME")

const sessAccessTokenExp = getConfig("SESS_ACCESS_TOKEN_EXPIRE_IN")

export default class SessionService {

  private signToken(sub:string, csrf:string, keepMeLoggedIn:boolean, exp:number, iat:number): Promise<string>{
    
    const payload = {
      sub,
      exp,
      iat,
      iss:sessName,
      csrf, kp:keepMeLoggedIn
    }
    return promisify(JsonWebToken.sign, payload, sessionSecretToken);
  }

  private verifyToken(token:string): Promise<JwtPayloadWithCsrfToken>{
    return promisify(
      JsonWebToken.verify, 
      token, 
      sessionSecretToken,
      {iss:sessName}
    );
  }

  getCsrfToken(){
    return getNanoId();
  }

  async getPayload(token : string) : Promise<TokenPayloadResult>{
    const result :{payload:JwtPayloadWithCsrfToken | null, msg:string} = {payload:null, msg:""};
    //if no token was supplied
    if(!token){
      result.msg = "You must be logged in to access this path."
    }else{
      try{
        result.payload = await this.verifyToken(token);
      }catch(e){
        switch((e as Error).name as TokenError){
          case "TokenExpiredError":
            result.msg = "Token expired. Please login again.";
          break

          case "NotBeforeError":
            result.msg = "Token no more active. Please login again."
          break
          
          default:
            result.msg = "Invalid token. Please login again."
          break;
        }//end switch
      }//end try
    }//end else
    return result;
  }//get method

  async generateToken(sub:string, keepMeLoggedIn:boolean){
    const iat : number = Date.now() / 1000;
    const exp : number = Math.floor((iat + sessAccessTokenExp));
    const csrf:string = this.getCsrfToken();
    //iat:now,
    const jwt = await this.signToken(sub, csrf, keepMeLoggedIn, exp, iat)
    return {exp, csrf, jwt}
  }

  setCookie(res:any, cookieValue="", expiresIn=0, path="/", httpOnly=true) {
    //default to empty string
    let expiryDate = "";
    if(expiresIn > 0){
      expiryDate = new Date(expiresIn * 1000).toUTCString();
    }
    console.log("Setting cookie")
    //const cookie = ``;
    // res.setHeader("Set-Cookie", `${sessName}=${cookieValue};expires=${expiryDate};path=${path};HttpOnly=${httpOnly};Secure=${true};SameSite=None;`);
    res.http.headers.set("Set-Cookie", `${sessName}=${cookieValue};expires=${expiryDate};path=${path};HttpOnly=${httpOnly};Secure=${true};SameSite=None;`)
  }
}//end object