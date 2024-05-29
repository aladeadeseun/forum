import { PubSub } from 'graphql-subscriptions';
import Enum from "./enum";
import Mutation from "./mutation";
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
  ...Enum,
  ...Scalar,
  Subscription:subscriptionResolver(pubsub),
  Query,
  Mutation
}