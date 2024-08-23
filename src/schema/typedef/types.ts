function getMutationResponse(mutationResponseName: string, dataRes?: string){
  
  if(dataRes){
    return `
      type ${mutationResponseName} implements MutationResponse {
        success: Boolean!
        msg: String
        error:JSON
        data:${dataRes}
      }
    `
  }
  return `
    type ${mutationResponseName} implements MutationResponse {
      success: Boolean!
      msg: String
      error:JSON
    }
  `
}
//ThreadQueryResponse
//Thread
function getQueryResponse(queryResponseName: string, dataType: string, desc?:string){
  return `
    ${desc ? ("#" + desc) : ""}
    type ${queryResponseName}{
      data:[${dataType}]
      pageInfo:PageInfo!
    }
  `
}

export default `#graphql
  
  #Each user detail
  type User{
    _id:ID!
    active:Boolean!
    email:String!
    username:String!
    shortBio:String!
    avatar:String!
    role:RoleType!
    isEmailVerified:Boolean!
  }

  type Category{
    _id:ID!
    name:String!
    createdAt:DateTime!
    updatedAt:DateTime!
  }

  type Thread{
    #Thread id
    _id:ID!
    #Indicate weather the thread is already locked
    locked:Boolean!
    #Thread title
    title:String!
    #Thread category
    category:Category!
    #The time the thread was created
    createdAt:DateTime!
    #The last time the thread was updated
    updatedAt:DateTime!
    #comments on the thread
    comments(pagination:Pagination):CommentQueryResponse
  }

  type Comment{
    _id:ID!
    #This comment is the added as part of the thread when it was created.
    isFirst:Boolean!
    #Thread or comment body or description
    body:String!
    #Thread or comment author 
    author:User!
    #This indicate wether the post was hidden from view because the comment violate the forum rules and regulation
    hidden:Boolean!
    #Thread
    thread:Thread!
    #Images for the comment can be empty
    commentImages:[CommentImage]!
    #total number of likes
    totalLikes:Int!
  }

  type CommentImage{
    url:String!
  }

  type PageInfo{
    hasNext:Boolean!
    hasPrev:Boolean!
    endCursor:ID
    startCursor:ID
  }

  type LikeComment{
    commentId:ID!
    totalLikes:Int!
  }

  ${getMutationResponse("CreateUserMutationResponse", "User")}
  ${getMutationResponse("LoginMutationResponse", "User")}
  ${getMutationResponse("SendVerificationEmailMutationResponse")}
  ${getMutationResponse("VerifyEmailMutationResponse")}
  ${getMutationResponse("CategoryRequestResponse", "Category")}
  ${getMutationResponse("CreateThreadResponse", "Thread")}
  ${getMutationResponse("LikeCommentMutationResponse", "Int")}
  ${getMutationResponse("CreateCommentResponse", "Comment")}
  ${getMutationResponse("ReportCommentResponse")}
  ${getMutationResponse("LockThreadResponse", "Thread")}

  ${getQueryResponse("ThreadQueryResponse", "Thread", "Thread query response.")}
  ${getQueryResponse("CommentQueryResponse", "Comment", "Comment query response.")}
`