import { MapperKind, getDirective, mapSchema } from '@graphql-tools/utils';
import { GraphQLFieldConfig, GraphQLSchema, defaultFieldResolver } from "graphql";
import { Context } from '../../util/context';
import { errorResponse } from '../../util/utility';

export function checkCsrfDirectiveWithDef(directiveName: string){
  return {
    //define
    checkCsrfDirectiveTypeDefs:`directive @${directiveName} on FIELD_DEFINITION`,
    //define a transfomer function
    checkCsrfDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema{
      //return mapschema
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig:GraphQLFieldConfig<any, any, any>) => {
          //get directive
          const csrfDirective = getDirective(schema, fieldConfig, directiveName)?.[0]

          //check if directive exists
          if (csrfDirective) {
            //get resolver from fieldConfig if not exists default to defaultResolver
            const { resolve = defaultFieldResolver } = fieldConfig
            //create a new resolver to replace the one sent by client
            fieldConfig.resolve = function(source:any, args:any, context:Context, info:any){

              //get the csrf from context
              const { csrf, clientCsrf } = context.userAuthReq
              
              //if client didn't send csrf or it's invalid, return error message
              if(csrf !== clientCsrf){
                return errorResponse("invalid_csrf")
              }

              return resolve(source, args, context, info)
            }//end function resolver
          }//end if
          //return field config back to caller
          return fieldConfig
        }
      })
    }
  }
}