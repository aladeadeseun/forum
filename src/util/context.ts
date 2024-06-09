
import getConfig from "../config";
import CategoryService from "../services/category.service";
import EmailService from "../services/email.service";
import OtpService from "../services/otp.service";
import SessionService from "../services/session.service";
import UserService from "../services/user.service";
import { UserAuthRequest } from "../types";

export interface Context {
  userService:UserService,
  sessionService:SessionService
  userAuthReq:UserAuthRequest,
  otpService:OtpService,
  emailService:EmailService,
  categoryService:CategoryService
}

const sessionService = new SessionService()
const sessName = getConfig("SESS_NAME")
const sessRefreshTokenExpiration = getConfig("SESS_REFRESH_TOKEN_EXPIRE_IN")

export async function context( { req } : {req:any}){
  //make a new instance of the user service object
  const userService = new UserService()
  const otpService = new OtpService()
  const emailService = new EmailService()
  const categoryService = new CategoryService()

  //get the token from cookie or header authorization
  const token:string  = (req.cookies && req.cookies[sessName]) || req.headers.authorization || ''
  //I expect client to put the csrf token in the header
  const clientCsrf = req.headers.csrf || ""

  //try to parse it
  const {msg, payload}  = await sessionService.getPayload(token);

  //set user auth request to default value
  const userAuthReq : UserAuthRequest = {
    user : null ,
    msg, 
    token,
    csrf:"",
    keepMeLoggedIn:false,
    exp:0,
    hasNewToken:false,
    clientCsrf
  };

  //if token was successfully decoded and we have subject
  if(payload){
    //if user is logged in, get the current user
    if(payload.sub && payload.sub !== ""){
      //get current user
      userAuthReq.user = await userService.getCurrentUser((payload.sub as any));   
    }//end if(payload.sub)
      
    //if client is loggedin check if we need to generate a new token
    if(payload.iat){
      //get current timestamp
      userAuthReq.hasNewToken = ((Date.now() / 1000) > (payload.iat + sessRefreshTokenExpiration));
      //if to refresh token
    }//end if(userAuthReq.loggedIn && payload.iat)
    //save csrf token
    userAuthReq.keepMeLoggedIn = payload.kp;
    userAuthReq.csrf = payload.csrf;
  }//end else
  //if user is coming for the first time or something happen to the token
  else{
    //try to generate a new one
    userAuthReq.hasNewToken = true;
  }//end else

  //if to generate a new token
  if(userAuthReq.hasNewToken){
    //genrate a new token
    const {exp, jwt, csrf} = await sessionService.generateToken(
      ((payload && payload.sub) ?? ""), 
      userAuthReq.keepMeLoggedIn
    );
    userAuthReq.token = jwt;
    userAuthReq.exp = exp;
    userAuthReq.csrf = csrf;
  }//end if(userAuthReq.hasNewToken)
  //return context
  return {
    userAuthReq, 
    userService, 
    sessionService, 
    otpService, 
    emailService,
    categoryService
  };
}//end function context