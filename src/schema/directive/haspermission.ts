import { MapperKind, getDirective, mapSchema, } from '@graphql-tools/utils';
import { GraphQLFieldConfig, GraphQLSchema, defaultFieldResolver } from "graphql";
import { RoleType } from '../../types';
import { Context } from '../../util/context';
import { errorResponse, getMsg } from '../../util/utility';

export function hasPermissionDirective(directiveName: string) {
  
  const typeDirectiveArgumentMaps: Record<string, any> = {}

  return {
    hasPermissionDirectiveDirectiveTypeDefs: `directive @${directiveName}(
      requires:[RoleType!]!,
      throwError:Boolean=true
    ) on OBJECT | FIELD_DEFINITION
    `,
    hasPermissionDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema{

      return mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          const permissionDirective = getDirective(schema, type, directiveName)?.[0]
          if (permissionDirective) {
            typeDirectiveArgumentMaps[type.name] = permissionDirective
          }
          return undefined
        },//[MapperKind.TYPE]

        [MapperKind.OBJECT_FIELD]: (fieldConfig:GraphQLFieldConfig<any, any, any>, _fieldName, typeName) => {

          const permissionDirective = (
            getDirective(schema, fieldConfig, directiveName)?.[0] 
            ?? typeDirectiveArgumentMaps[typeName]
          )

          if (permissionDirective) {

            //console.log(loggedInDirective)

            const {requires, throwError} = permissionDirective

            //console.log(requires)

            const { resolve = defaultFieldResolver } = fieldConfig

            fieldConfig.resolve = function (source:any, args:any, context:Context, info:any) {

              const user = context.userAuthReq.user

              if(!user){
                
                if(throwError)
                  throw new Error(getMsg("auth_error"))
                else{
                  return errorResponse("auth_error")
                }
              }

              //console.log({role:user.role})

              if((requires as RoleType[]).indexOf(user.role) < 0){
                if(throwError){
                  throw new Error(getMsg("permission_error"))
                }
                return errorResponse("permission_error")
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
 