import { Types } from "mongoose"
import ReportedCommentModel from "../model/report.schema"
type TotalCommentReportAggregate = {totalReport:number,_id:Types.ObjectId}

export class ReportCommentService{
  async reportComment(comment: Types.ObjectId, userId: Types.ObjectId){

    //If this user already reported this comment, I don't what to alert the admin
    const reportExists = await ReportedCommentModel.findOne(
      {$and:[{comment}, {reports:{$elemMatch:{$eq:userId}}}]}, ["_id"]
    )

    //if the user already reported this comment
    if(reportExists){
      return false
    }
    
    //insert if exists or create it not exist
    await ReportedCommentModel.updateOne(
      {comment}, {$addToSet:{reports:userId}}, {upsert:true}
    )

    //initial total reports to 0
    let totalReport = 0

    //calculate the total number of reports and return to caller
    const totalReportAggregate = await ReportedCommentModel.aggregate([
      {$match:{comment}},
      {$project:{totalReport:1, comment:1, reports:1}},
      {$unwind:'$reports'},
      {$group:{
        _id:"$comment", 
        totalReport:{$sum:1}
      }}
    ]) as TotalCommentReportAggregate[]

    if(totalReportAggregate.length > 0){
      totalReport = totalReportAggregate[0].totalReport
    }

    return totalReport
  }
}