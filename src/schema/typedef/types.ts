function getMutationResponse(mustionResponse: string, dataRes?: string){
  
  if(dataRes){
    return `
      type ${mustionResponse} implements MutationResponse {
        success: Boolean!
        msg: String
        error:JSON
        data:${dataRes}
      }
    `
  }
  return `
    type ${mustionResponse} implements MutationResponse {
      success: Boolean!
      msg: String
      error:JSON
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

  ${getMutationResponse("CreateUserMutationResponse", "User")}
  ${getMutationResponse("LoginMutationResponse", "User")}
  ${getMutationResponse("SendVerificationEmailMutationResponse")}
  ${getMutationResponse("VerifyEmailMutationResponse")}
`