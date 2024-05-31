import { Types } from "mongoose";
import getConfig from "../config";
import OtpModel from "../model/otp.schema";
import { getRandomNumber } from "../util/utility";

const maxPinReg = getConfig("MAX_PIN_REG")
const maxPinRegWaitTime = getConfig("MAX_PIN_REG_WAIT_TIME")
const otpExpiryInSeconds = getConfig('OTP_EXPIRY_IN_MIN') * 60


export default class OtpService{
  
  async createOtp(userId:Types.ObjectId){

    //get user otp
    let otp = await this.getOneOtp(userId)

    const counterTimestamp = Math.floor(Date.now() / 1000)
    //if the otp is yet to be generated for user
    if(!otp){
      //generate new model
      otp = new OtpModel({}) 
      otp.used = false
      otp.user = userId
      otp.genCounter = 0
      otp.counterTimestamp = 0
    }
    else if(otp.used){
      otp.used = false
      //by setting to zero, increment down
      otp.genCounter = 0
      otp.counterTimestamp = 0
    }

    //if the used value is set
    if(otp.genCounter >= maxPinReg){

      if(otp.counterTimestamp === 0){
        otp.counterTimestamp = counterTimestamp
        await otp.save()
      }

      //ensure client wait for one hour before they can generate new otp 
      const waitTime = (maxPinRegWaitTime + otp.counterTimestamp) - counterTimestamp
      if(waitTime > 0){
        
        return `You have to wait for ${Math.floor(waitTime / 60)} minute(s) before you can generate new otp token.`;
      }else{
        //user already waited for one hour, so set counter timestamp to current time
        otp.counterTimestamp = 0
        //by setting to zero it will be incremented later
        otp.genCounter = 0
      }
    }
    //increment otp counter
    otp.genCounter += 1
    //set pin
    otp.pin = getRandomNumber(1000, 9999).toString()
    //I need this timestamp to ensure client verify email within 5 minutes
    otp.timestamp = counterTimestamp
    //update 
    await otp.save()

    return otp
  }

  getOneOtp(userId:Types.ObjectId){
    return OtpModel.findOne({user:userId})
  }

  async verifyUserEmail(userId:Types.ObjectId, pin: string){
    //get user otp
    let otp = await this.getOneOtp(userId)

    //if the otp is yet to be generated for user
    if(!otp){
      //generate new model
      return {success:false, msg:"User otp cannot be found."}
    }

    if(otp.used){
      //generate new model
      return {success:false, msg:"User otp has already been used."}
    }

    const now = Math.floor(Date.now() / 1000)

    if((otpExpiryInSeconds + otp.timestamp) < now){
      //generate new model
      return {success:false, msg:"User otp has already expired."}
    }

    if(otp.pin !== pin){
      return {success:false, msg:"Invalid otp pin"}
    }

    otp.used = true
    
    await otp.save()

    return {success:true, msg:"User email successfully verified."}
  }
}