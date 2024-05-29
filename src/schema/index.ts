import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import { checkCsrfDirectiveWithDef } from './directive/check_csrf';
import { upperDirectiveWithDef } from "./directive/upper";
import resolvers from './resolvers';
import typeDefs from './typedef';

//get directive
const {upperDirectiveTransformer, upperDirectiveTypeDefs} = upperDirectiveWithDef("upper")
const {checkCsrfDirectiveTransformer, checkCsrfDirectiveTypeDefs} = checkCsrfDirectiveWithDef("checkCsrf")

let schema = makeExecutableSchema({ 
  typeDefs:[
    upperDirectiveTypeDefs, 
    checkCsrfDirectiveTypeDefs,
    ...typeDefs
  ], 
  resolvers 
})

export default [upperDirectiveTransformer, checkCsrfDirectiveTransformer].reduce(
  (schema: GraphQLSchema, transfomer:(schema:GraphQLSchema)=>GraphQLSchema) => transfomer(schema), 
  schema
)