export default `#graphql
  interface MutationResponse {
    #code: String!
    success: Boolean!
    msg: String
    error:JSON
  }
`