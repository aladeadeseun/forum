//import { getRandomNumber } from "./util/utility"
//import { readFileSync } from "node:fs"
//import { join } from "node:path"
import { connectDB } from "./db/connectDB"
import CommentImageService from "./services/comment-image.service"
// for(let i = 0; i < 10; i++){
//   console.log(getRandomNumber(1, 100))
// }


async function main(){
  
  await connectDB()

  //console.log(join(__dirname, "..", "test-image",  "NATPL008.JPG"))

  //const picBuffer = readFileSync(join(__dirname, "..", "test-image",  "NATPL008.JPG"), "binary") as any
  const commentImageService = new CommentImageService()
  //await commentImageService.create(picBuffer)
  console.log(await commentImageService.getCommentImage())
}

//main().catch(console.error)
