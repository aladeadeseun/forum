import { PubSub } from 'graphql-subscriptions';
import Query from './query';
import Scalar from './scalar';
import subscriptionResolver from "./subscription/resolvers";

// ${require("./enum")}
// ${require("./scalar")}
// ${require("./input")}
// ${require("./type")}
// ${require("./mutation")}
// ${require("./query")}

const pubsub = new PubSub();

export default {
  ...Scalar,
  Subscription:subscriptionResolver(pubsub),
  Query,
}