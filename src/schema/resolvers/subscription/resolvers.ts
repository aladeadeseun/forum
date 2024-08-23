
//import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import { SubscritionEventType } from '../../../enum';
import { LikedComment } from '../../../types';

export default function subscriptionResolver(pubsub: RedisPubSub){
  
  return {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
    },
    // likedComment:{
    //   subscribe:(_:any, args:any) => {

    //     console.log(_, args)

    //     return pubsub.asyncIterator([SubscritionEventType.LIKED_COMMENT])
    //   }
    // }
    likedComment:{
      //I want to send the update only to other user who are viewing this thread apart from user who just like the post
      subscribe:withFilter(
        (_:any, _args:any)=>{
          //console.log(_, args)
          return pubsub.asyncIterator([SubscritionEventType.LIKED_COMMENT])
        },
        (
          {filter, likedComment}:{likedComment:LikedComment, filter:{except:string, threadId:string}}, 
          {userId,threadId}:{userId?:string | null, threadId:string}
        )=>{
          //console.log({payload, variables})
          console.log({filter,likedComment})
          console.log({userId, threadId})
          //payload.except !== variables.userId
          return(
            //send the notificatiion to only user who are currently viewing this thread
            filter.threadId === threadId 
            //send to all user viewing this thread except the user who just like the comment
            && userId !== filter.except
          )
          //return (userId)
        }
      )
    }
  }
}