
import { PubSub } from 'graphql-subscriptions';

export default function subscriptionResolver(pubsub: PubSub){
  
  return {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
    },
  }
}