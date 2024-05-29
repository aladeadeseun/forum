export default `#graphql
  type Mutation{
    createNewUser(input:CreateUserInput!):CreateUserMutationResponse @checkCsrf
    userLogin(input:LoginInput!):LoginMutationResponse @checkCsrf
  }
`