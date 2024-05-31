export default `#graphql
  type Mutation{
    #user registration mutation
    createNewUser(input:CreateUserInput!):CreateUserMutationResponse @checkCsrf
    #User login mutation
    userLogin(input:LoginInput!):LoginMutationResponse @checkCsrf
    #Send otp email for email verification
    sendOtpEmail:SendVerificationEmailMutationResponse @checkCsrf @isloggedin(emailMustBeVerified: false, throwError:false)
    #verify email with pin mutation
    verifyEmail(pin:String): VerifyEmailMutationResponse @checkCsrf @isloggedin(emailMustBeVerified: false, throwError:false)
  }
`