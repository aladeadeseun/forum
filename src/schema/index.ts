import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import { checkCsrfDirectiveWithDef } from './directive/check_csrf';
import { isLoggedInDirective } from './directive/islogged';
import { upperDirectiveWithDef } from "./directive/upper";
import resolvers from './resolvers';
import typeDefs from './typedef';

//get directive
const {upperDirectiveTransformer, upperDirectiveTypeDefs} = upperDirectiveWithDef("upper")
const {checkCsrfDirectiveTransformer, checkCsrfDirectiveTypeDefs} = checkCsrfDirectiveWithDef("checkCsrf")
const {loggedInDirectiveTransformer, loggedInDirectiveTypeDefs} = isLoggedInDirective("isloggedin")

let schema = makeExecutableSchema({ 
  typeDefs:[
    upperDirectiveTypeDefs, 
    checkCsrfDirectiveTypeDefs,
    loggedInDirectiveTypeDefs,
    ...typeDefs
  ], 
  resolvers 
})

export default [
  upperDirectiveTransformer, 
  checkCsrfDirectiveTransformer,
  loggedInDirectiveTransformer
].reduce(
  (schema: GraphQLSchema, transfomer:(schema:GraphQLSchema)=>GraphQLSchema) => transfomer(schema), 
  schema
)