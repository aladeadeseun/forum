import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './resolvers';
import typeDefs from './typedef';

export default makeExecutableSchema({ typeDefs, resolvers })