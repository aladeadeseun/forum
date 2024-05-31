import getConfig from "../config";
import { PayslipAttachments } from "../types";

const nodemailer = require("nodemailer")

//import * as nodemailer from "nodemailer"

const fromMail= getConfig("FROM_MAIL")

const config: {
  service: string,
  auth:{
    user:string,
    pass:string
  }
} = {
  service:getConfig("MAIL_SERVICE"),
  auth:{
    user:getConfig("MAIL_USERNAME"), 
    pass:getConfig("MAIL_PASS")
  }
}

function sendEmailHelper(
  config:{ service: string; auth: { user: string; pass: string; };},
  toEmailAddress: string,
  subject: string, 
  mail: any,
  attachments?: PayslipAttachments
){
  return nodemailer.createTransport(config).sendMail({
    from:fromMail,
    to:toEmailAddress,
    subject,
    html:mail,
    attachments
  })
}

export default class EmailService{
  sendEmail(toEmailAddress: string, subject: string, emailBody:string, attachments?: PayslipAttachments): Promise<void>{
    //.sendMail(message)
    return sendEmailHelper(config, toEmailAddress, subject, emailBody, attachments)
  }

  sendErrorEmail(error: any, path: string, statusCode: number){
    //statusCode: responseBody.statusCode,
    //path: httpAdapter.getRequestUrl(ctx.getRequest()),
    //timestamp: new Date().toISOString(),
    
    return sendEmailHelper(
      config, 
      "aladeadeseun@gmail.com", 
      "Server Error", `
        <p>message: ${error.message}</p>
        <p>name: ${error.name}</p>
        <p>stacktrace: ${error.stack || "No stacktrace"}</p>
        <p>code: ${error.code || "No Code"}</p>
        <p>path: ${path}</p>
        <p>timestamp: ${ new Date().toISOString()}</p>
        <p>statusCode: ${ statusCode }</p>
      `
    ).catch()
  }
}