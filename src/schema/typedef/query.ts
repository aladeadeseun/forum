export default `#graphql
  type Query{
    hello: String @upper @isloggedin(emailMustBeVerified: true, throwError:true),
    self:User,
    categories:[Category]
    threads(pagination:Pagination, filter:FilterThread):ThreadQueryResponse
    comments(pagination:Pagination, filter:FilterComment): CommentQueryResponse
    oneThread(threadID:ID!): Thread
  }
`