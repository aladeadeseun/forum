export default `#graphql
  input LoginInput{
    #Am not make it compulsory because I want to do input validation.
    #User password
    password:String
    #User can login with email or username
    usernameOrEmail:String
    #I need this value to set cookie value.
    keepMeLoggedIn:Boolean!=false
  }

  #Am not make it compulsory because I want to do input validation. All field marked as required should be supplied by user.
  input CreateUserInput{
    #User email, required. 
    email:String
    #Username is required because it's going to be anonymous forum and I don't want to expose user email, required.
    username:String
    #Confirm password, required
    cfmPsd:String
    #Login password, required.
    password:String
    #Short bio, optional
    shortBio:String=""
  }

  input CreateThreadInput{
    #Thread title.
    title:String!
    #Thread content.
    content:String!
    #comment image array
    commentImageID:[ID]=[]
    #thread category
    categoryId:ID!
  }

  input CreateComment{
    #Thread ID
    threadId:ID!
    #Thread content.
    content:String!
    #comment image array
    commentImageID:[ID]=[]
  }

  input Pagination{
    cursor:String
    limit:Int
    afterOrBefore:Boolean
  }

  input FilterThread{
    categoryId:ID,
    shouldBeOnFrontPage:Boolean
  }

  input FilterComment{
    thread:ID
    author:ID
  }
`