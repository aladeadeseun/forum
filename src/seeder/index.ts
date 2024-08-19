import { faker } from '@faker-js/faker';
import argon2 from "argon2";
import mongoose, { Types } from "mongoose";
import getConfig from '../config';
import { connectDB, disconnectDB } from '../db/connectDB';
import CategoryModel, { Category } from '../model/category.schema';
import CommentModel, { Comment } from '../model/comment.schema';
import ThreadModel, { Thread } from '../model/thread.schema';
import UserModel, { User } from '../model/user.schema';
import { RoleType } from '../types';
import { sleep } from "../util/utility";

const saltRounds = getConfig("SALT_ROUND")

const getRandomNumber = (min: number, max: number)=>(min + Math.ceil(Math.random() * (max - min)))

function getUniqueWords(howMany: number){

  const words: Record<string, true> = {}

  while(true){
    words[faker.lorem.word({length:{min:6, max:15}})] = true

    if(Object.keys(words).length >= howMany) break
  }

  return Object.keys(words)
}

function getUserName(howMany: number){
  const usernames: Record<string, true> = {}

  while(true){
    usernames[faker.internet.userName()] = true

    if(Object.keys(usernames).length >= howMany) break
  }

  return Object.keys(usernames)
}

async function getUsers(howMany: number, usernames: string[]){
  
  const users: User[] = []

  const mongoDB_Id = await getMongoDBId(howMany)

  for(let i = 0; i < howMany; i++){
    users.push({
      _id:mongoDB_Id[i],
      email:faker.internet.email({
        firstName:usernames[i], allowSpecialCharacters:true
      }),
      username:usernames[i],
      password:await argon2.hash("password",{hashLength:saltRounds}),
      active:true,
      avatar:"avatar.png",
      role:RoleType.MEMBER,
      isEmailVerified:true,
      shortBio:""
    })
  }//end for loop
  return users
}

async function getMongoDBId(howMany: number){
  const mongoDB_Id: Types.ObjectId[] = []
  for(let i = 0; i < howMany; i++){
    mongoDB_Id.push(new Types.ObjectId())
    //I read that the _id is generated base on time, so I want the time to be different
    await sleep(100).promise
  }

  return mongoDB_Id
}

async function getCategory(howMany: number): Promise<Category[]>{
  //const 
  const categories: Category[] = []

  const mongoDB_Id: Types.ObjectId[] = await getMongoDBId(howMany)
  const categoryNames: string[] = getUniqueWords(howMany)

  for(let i = 0; i < howMany; i++){
    categories.push({
      _id:mongoDB_Id[i],
      name:categoryNames[i],
      deletedAt:null
    })
  }

  return categories
}

async function getThreads(howMany: number, categories: Types.ObjectId[]){
  
  const mongoDB_Id: Types.ObjectId[] = await getMongoDBId(howMany)

  const threads: Thread[] = []

  const categoryLength = categories.length - 1

  for(let i = 0; i < howMany; i++){
    threads.push({
      _id:mongoDB_Id[i],
      locked:false,
      title:faker.lorem.lines(1),
      category:categories[getRandomNumber(1, categoryLength)],
      shouldBeOnFrontPage: (getRandomNumber(1, 10) < 8)
    })
  }

  return threads
}

async function getComments(howMany: number, threadId: Thread["_id"], authorIds: Types.ObjectId[]){

  const comments: Comment[] = []

  const maxAuthorIdIndex = authorIds.length - 1

  const mongoDB_Id = await getMongoDBId(howMany)

  for(let i = 0; i < howMany; i++){

    comments.push({
      _id:mongoDB_Id[i],
      hidden:false,
      isFirst : (i === 0),
      body:faker.lorem.paragraph({min: 3, max:5}),
      thread:threadId,
      images:[],
      author:authorIds[getRandomNumber(1, maxAuthorIdIndex)]
    })

  }//end for loop

  return comments
}//end function

function displayMsg(text: string){
  console.log(`--------------------------${text}--------------------------`)
}


async function main(){
  
  displayMsg("generating category")
  //get category
  const categories = await getCategory(10)
  displayMsg("generating category ends")

  displayMsg("generating usernames")
  const usernames = getUserName(40)
  displayMsg("generating usernames end")

  displayMsg("generating users")
  const users = await getUsers(40, usernames)
  displayMsg("generating users end")

  displayMsg("generating thread")
  const threads = await getThreads(30, categories.map(c => c._id))
  displayMsg("generating thread ends")

  displayMsg("generating comments")
  const comments: Comment[][] = []
  const authorIds = users.map(u=>u._id)
  
  for(const thread of threads){
    comments.push(await getComments(getRandomNumber(10, 30), thread._id, authorIds))
  }

  displayMsg("generating comments end")

  displayMsg("connecting to the database")

  await connectDB()
 
  displayMsg("Starting session")

  const session = await mongoose.startSession()

  try{
        
    session.startTransaction()

    displayMsg("inserting categories into database")
    await CategoryModel.insertMany(categories, {session})

    displayMsg("inserting users into database")
    await UserModel.insertMany(users, {session})

    displayMsg("inserting thread into database")
    await ThreadModel.insertMany(threads, {session})

    displayMsg("inserting comments into the database")
    for(const commentList of comments){
      await CommentModel.insertMany(commentList, {session})
      await sleep(500).promise
    }

    displayMsg("Commiting transaction")
    session.commitTransaction()
  }
  catch(e){
    displayMsg("Abort transaction")
    await session.abortTransaction()
    throw e
  }
  finally{
    displayMsg("Ending transaction")
    await session.endSession()
  }

  displayMsg("Closing database")
  await disconnectDB()
}

// for(let i = 0; i < 40; i++){
//   console.log(getRandomNumber(1, 20))
// }

main()
