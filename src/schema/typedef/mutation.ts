export default `#graphql
  type Mutation{
    createNewUser(input:CreateUserInput!):CreateUserMutationResponse
    userLogin(input:LoginInput!):LoginMutationResponse
  }
`