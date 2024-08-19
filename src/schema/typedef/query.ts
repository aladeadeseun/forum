export default `#graphql
  type Query{
    hello: String @upper @isloggedin(emailMustBeVerified: true, throwError:true),
    self:User,
    categories:[Category]
    threads(pagination:Pagination, filter:FilterThread):ThreadQueryResponse 
  }
`