export default `#graphql
  interface MutationResponse {
    success: Boolean!
    msg: String
    error:JSON
  }

  interface QueryResponseWithPagination{
    success: Boolean!
    msg: String
  }
`