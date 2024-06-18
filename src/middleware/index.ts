import busboy from "busboy";
import { NextFunction, Request, Response } from 'express';
import { Types } from "mongoose";
import internal from "stream";
import getConfig from "../config";
import CommentImageService from "../services/comment-image.service";
import SessionService from "../services/session.service";


const sessName = getConfig("SESS_NAME")
const sessionService = new SessionService()
const sessionAccessTokenExpiresIn = getConfig('SESS_ACCESS_TOKEN_EXPIRE_IN')
//4MB
const MAX_FILE_SIZE = 4_194_304//1048576 * 4

type UploadFileMetadata = { name:string, success:boolean, msg:string, buffer: Buffer,mimeType:string }
type UploadResponseType = { name:string, success:boolean, msg:string,imgId?:string }

export async function authMiddleware(req: Request, res: Response, next: NextFunction){
  //get the token from cookie or header authorization
  const token:string  = (req.cookies && req.cookies[sessName]) || req.headers.authorization || ''

  //I expect client to put the csrf token in the header
  //const clientCsrf = req.headers.csrf || (req.body && req.body.csrf) || ""

  //try to parse it
  const {msg, payload}  = await sessionService.getPayload(token);

  //if the payload is undefined client need to relogin
  if(!payload) return res.status(401).send({success:false, msg})
  
  if(!payload.sub) return res.status(401).send({success:false, msg})

  //const userService = new UserService()
  //check if the token is yet to expired
  if(!payload.iat) return res.status(401).send({sucess:false, msg:"Token expired. Try to login and retry."})

  if(Math.floor((Date.now() / 1000)) > (payload.iat + sessionAccessTokenExpiresIn)){
    return res.status(401).json({sucess:false, msg:"Token expired. Try to login and retry."})
  }
  //add csrf
  if(req.body) {
    req.body.csrf = payload.csrf
  }
  else {
    req.body = {csrf : payload.csrf}
  }

  //console.log(req.body)
  return next()
}

export function uploadCommentImageMiddleware(req: Request, res: Response){
  //get 
  const bb = busboy({ headers: req.headers, limits:{files:3, fileSize:MAX_FILE_SIZE} });
  
  //I need this variable to keep track of the uploaded files
  //what am trying to do is that, if some files are not images or the file size
  //exceeded the allowed max size, it won't be saved in the db
  const uploadFiles: UploadFileMetadata[] = []
  //I need this variable to tell me if error occur so I won't save in the db
  //let errored = false
  const fields: Record<string, any> = {}

  //get service to create the image in db
  const commentImageService = new CommentImageService()

  //error handler
  bb.on("error", (error)=>{
    console.error(error)
    return res.status(500).json({
      success:false, 
      msg:"Internal server error.",
      uploadFiles
    })
  })

  //handle file upload
  bb.on("file", (
    _name: string, 
    file: internal.Readable & { truncated?: boolean | undefined; }, 
    info: busboy.FileInfo)=>{

      //const { filename, encoding, mimeType } = info;
      const { filename, mimeType } = info;

      //instantiate the object
      const uploadFileMetadata: UploadFileMetadata = {
        name:filename, 
        success:false, 
        msg:"", 
        buffer:Buffer.alloc(0),
        mimeType
      }

      //If its invalid mime type don't upload at all
      if(["image/jpeg", "image/png", "image/gif", "image/jpg"].indexOf(mimeType) < 0){
        //set message
        uploadFileMetadata.msg = "Only image of jpeg, png, gif, jpg is allowed."
        //push to array
        uploadFiles.push(uploadFileMetadata)
        //prevent execution from reaching down
        return
      }//end if(["image/jpeg", "image/png", "image/gif", "image/jpg"].indexOf(mimeType) < 0)

      // console.log(
      //   `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      //   filename,
      //   encoding,
      //   mimeType
      // )
      
      //console.log({mimeType, filename})

      //check to ensure client actually upload image with extension of required type like jpg, jpeg, png or gif
      //https://stackoverflow.com/questions/14269233/node-js-how-to-read-a-stream-into-a-buffer
      //https://blog.logrocket.com/node-js-buffer-complete-guide/
      //create buffer array here
      const bufArray: Buffer[] = []
      //use to hold total length. if the length is above our max size the file will be ignored
      let totalLength = 0
      
      //on data event 
      file.on('data', (data) => {
        //console.log(`File [${name}] got ${data.length} bytes`);
        //increment file size
        totalLength += data.length
        //push to array
        bufArray.push(data)
      })
      //after upload is done
      .on('close', async () => {
        //console.log(`File [${name}] done`);

        //check if the file size is not above max file size
        if(totalLength <= MAX_FILE_SIZE){
          uploadFileMetadata.buffer = Buffer.concat(bufArray)
          uploadFileMetadata.success = true
        }//end if
        else{
          uploadFileMetadata.msg = "Maximum upload file size exceeded."
        }
        //push to array
        uploadFiles.push(uploadFileMetadata)
      });//end on close event handler
    }//end event handler
  )//end on file

  bb.on('field', (name, val, _info) => {
    //console.log(`Field [${name}]: value: %j`, val);
    fields[name] = val
  });

  // bb.on("finish", ()=>{})

  bb.on("close", async ()=>{
    //check csrf token
    if(!fields.csrf || fields.csrf !== req.body.csrf){
      return res.status(419).json({success:false, msg:"Invalid csrf token"})
    }//end if(!fields.csrf || fields.csrf !== req.body.csrf)
    //
    const responseList: UploadResponseType[] = []

    //loop through uploaded image array
    for(const commentImage of uploadFiles){
      //create image id, it will be added later to create image
      let imgId = undefined
      //if the upload is valid and was successfully uploaded
      if(commentImage.success){
        //save in database and get the _id, it'll be sent to the client to be added to the image later
        imgId = (await commentImageService.create({
          content:commentImage.buffer,
          mimeType:commentImage.mimeType
        }))._id.toHexString()
      }//end if(commentImage.success)

      //push the response to be sent back to client object
      responseList.push({
        success:commentImage.success, 
        msg:commentImage.msg, 
        name:commentImage.name,
        imgId
      })
    }//end for loop

    return res.status(200).json({ responseList })
  })

  req.pipe(bb)
}

export function testingCsrf(_req:Request, res: Response){
  return res.status(200).json({success:true})
}


//I need this for testing purpose
const PORT = getConfig("PORT")

export function getUploadImgHtml(req: Request, res: Response){
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <meta charset="UTF-8">
    </head>

    <body>
      <form action="http://localhost:${PORT}/upload" method="post" enctype="multipart/form-data">
        <div>
          <label for="cmtImg">Select picture</label>
          <input type="file" name="cmtImg" multiple accept=".png,.jpeg,.gif,.jpg" />
          <input type='hidden' name="csrf" value="${req.body.csrf}"/>
          <input type='submit' value="Upload"/>
        </div>
      </form>
    </body>

    </html>
  `)
}

export async function showImage(req: Request, res: Response){
  let cmtImgId: Types.ObjectId | undefined = undefined
  //try to cast the _id to ensure I don't get error when fetching from db
  try{
    cmtImgId = new Types.ObjectId(req.params.cmtImgId)
  }
  catch(e){}

  if(!cmtImgId){
    return res.status(500).end()
  }

  const commentImage = await (new CommentImageService().getOneCommentImage(cmtImgId, {content:1, mimeType:1}))
  
  if(!commentImage){
    return res.status(404).end("Not Found")
  }
  res.writeHead(200, {
    'Content-Type': commentImage.mimeType,
    //'Content-disposition': 'attachment;filename=' + filename,
    'Content-Length': commentImage.content.length
  })
  return res.end(commentImage.content);
}