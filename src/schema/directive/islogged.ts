import { MapperKind, getDirective, mapSchema, } from '@graphql-tools/utils';
import { GraphQLFieldConfig, GraphQLSchema, defaultFieldResolver } from "graphql";
import { Context } from '../../util/context';
import { errorResponse, getMsg } from '../../util/utility';

export function isLoggedInDirective(directiveName: string) {
  
  const typeDirectiveArgumentMaps: Record<string, any> = {}

  return {
    loggedInDirectiveTypeDefs: `directive @${directiveName}(
      emailMustBeVerified: Boolean = true,
      throwError:Boolean=true
    ) on OBJECT | FIELD_DEFINITION
    `,
    loggedInDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema{

      return mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          const loggedInDirective = getDirective(schema, type, directiveName)?.[0]
          if (loggedInDirective) {
            typeDirectiveArgumentMaps[type.name] = loggedInDirective
          }
          return undefined
        },//[MapperKind.TYPE]

        [MapperKind.OBJECT_FIELD]: (fieldConfig:GraphQLFieldConfig<any, any, any>, _fieldName, typeName) => {

          const loggedInDirective = (
            getDirective(schema, fieldConfig, directiveName)?.[0] 
            ?? typeDirectiveArgumentMaps[typeName]
          )

          if (loggedInDirective) {

            //console.log(loggedInDirective)

            const {emailMustBeVerified, throwError} = loggedInDirective

            const { resolve = defaultFieldResolver } = fieldConfig

            fieldConfig.resolve = function (source:any, args:any, context:Context, info:any) {

              if(!context.userAuthReq.user){
                
                if(throwError)
                  throw new Error(getMsg("auth_error"))
                else{
                  return errorResponse("auth_error")
                }
              }

              if(emailMustBeVerified && !context.userAuthReq.user.isEmailVerified){
                if(throwError)
                  throw new Error(getMsg("email_verification_error"))
                else{
                  return errorResponse("email_verification_error")
                }
              }

              return resolve(source, args, context, info)
            }//end 

          }//end if (authDirective)

          return fieldConfig
        }//end [MapperKind.OBJECT_FIELD]
      })
    }
  }//end return object
}
 