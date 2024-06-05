import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import { checkCsrfDirectiveWithDef } from './directive/check_csrf';
import { hasPermissionDirective } from './directive/haspermission';
import { isLoggedInDirective } from './directive/islogged';
import { upperDirectiveWithDef } from "./directive/upper";
import resolvers from './resolvers';
import typeDefs from './typedef';

//get directive
const {upperDirectiveTransformer, upperDirectiveTypeDefs} = upperDirectiveWithDef("upper")
const {checkCsrfDirectiveTransformer, checkCsrfDirectiveTypeDefs} = checkCsrfDirectiveWithDef("checkCsrf")
const {loggedInDirectiveTransformer, loggedInDirectiveTypeDefs} = isLoggedInDirective("isloggedin")
const {hasPermissionDirectiveTransformer, hasPermissionDirectiveDirectiveTypeDefs} = hasPermissionDirective('haspermission')

let schema = makeExecutableSchema({ 
  typeDefs:[
    upperDirectiveTypeDefs, 
    checkCsrfDirectiveTypeDefs,
    loggedInDirectiveTypeDefs,
    hasPermissionDirectiveDirectiveTypeDefs,
    ...typeDefs
  ], 
  resolvers 
})

export default [
  upperDirectiveTransformer, 
  checkCsrfDirectiveTransformer,
  loggedInDirectiveTransformer,
  hasPermissionDirectiveTransformer
].reduce(
  (schema: GraphQLSchema, transfomer:(schema:GraphQLSchema)=>GraphQLSchema) => transfomer(schema), 
  schema
)