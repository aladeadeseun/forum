export default `#graphql
  type Subscription {
    numberIncremented: Int,
    likedComment(threadId:ID!, userId:ID):LikeComment!
  }
`