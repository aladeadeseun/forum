export default `#graphql
  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String
    error:JSON
  }
`