//import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Enum from "./enum";
import mutationResolver from "./mutation";
import Query from './query';
import Scalar from './scalar';
import __Type from "./types";

import subscriptionResolver from "./subscription/resolvers";
// ${require("./enum")}
// ${require("./scalar")}
// ${require("./input")}
// ${require("./type")}
// ${require("./mutation")}
// ${require("./query")}

//const pubsub = new PubSub();
const pubsub = new RedisPubSub()

export default {
  ...Enum,
  ...Scalar,
  ...__Type,
  Subscription:subscriptionResolver(pubsub),
  Query,
  Mutation:mutationResolver(pubsub)
}