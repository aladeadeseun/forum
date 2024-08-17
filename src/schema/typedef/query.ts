export default `#graphql
  type Query{
    hello: String @upper @isloggedin(emailMustBeVerified: true, throwError:true),
    self:User,
    categories:[Category] @isloggedin(emailMustBeVerified: true, throwError:true) @haspermission(requires:[ADMIN], throwError:true)
    threads(pagination:Pagination, filter:FilterThread):ThreadQueryResponse 
  }
`