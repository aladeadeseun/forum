export default `#graphql
  type Mutation{
    #user registration mutation
    createNewUser(input:CreateUserInput!):CreateUserMutationResponse @checkCsrf
    #User login mutation
    userLogin(input:LoginInput!):LoginMutationResponse @checkCsrf
    #Send otp email for email verification
    sendOtpEmail:SendVerificationEmailMutationResponse @checkCsrf @isloggedin(emailMustBeVerified: false, throwError:false)
    #verify email with pin mutation
    verifyEmail(pin:String!): VerifyEmailMutationResponse @checkCsrf @isloggedin(emailMustBeVerified: false, throwError:false)
    #create new category
    createCategory(name:String!): CategoryRequestResponse @checkCsrf @isloggedin(emailMustBeVerified: true, throwError:false) @haspermission(requires:[ADMIN], throwError:false)
    #update existing category
    updateCategory(name:String!, categoryId:ID!): CategoryRequestResponse @checkCsrf @isloggedin(emailMustBeVerified: true, throwError:false) @haspermission(requires:[ADMIN], throwError:false)
    #delete existing category
    deleteCategory(categoryId:ID!): CategoryRequestResponse @checkCsrf @isloggedin(emailMustBeVerified: true, throwError:false) @haspermission(requires:[ADMIN], throwError:false)
    #Create new thread mutation
    # createThread():CreateThreadResponse
  }
`
//@haspermission(requires:[ADMIN], throwError:false)
//requires:RoleType[] = [],