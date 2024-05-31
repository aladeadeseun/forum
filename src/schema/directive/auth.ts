import { MapperKind, getDirective, mapSchema, } from '@graphql-tools/utils';
import { GraphQLFieldConfig, GraphQLSchema, defaultFieldResolver } from "graphql";
import { Context } from '../../util/context';

function authDirective(
  directiveName: string, 
  getUserFn: (token: string) => { hasRole: (role: string) => boolean }
) {
  
  const typeDirectiveArgumentMaps: Record<string, any> = {}

  return {
    authDirectiveTypeDefs: `directive @${directiveName}(
      requires: Role = ADMIN,
    ) on OBJECT | FIELD_DEFINITION

    enum RoleType{
      MEMBER,
      MODERATOR,
      ADMIN,
      REVIEWER,
      GUEST,
    }
    `,
    authDirectiveTransformer(schema: GraphQLSchema){
      return mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          const authDirective = getDirective(schema, type, directiveName)?.[0]
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective
          }
          return undefined
        },//[MapperKind.TYPE]

        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective = (
            getDirective(schema, fieldConfig, directiveName)?.[0] 
            ?? typeDirectiveArgumentMaps[typeName]
          )

          if (authDirective) {
            const { requires } = authDirective
            
            if (requires) {

              const { resolve = defaultFieldResolver } = fieldConfig
              fieldConfig.resolve = function (source, args, context, info) {
                const user = getUserFn(context.headers.authToken)
                if (!user.hasRole(requires)) {
                  throw new Error('not authorized')
                }
                return resolve(source, args, context, info)
              }
              return fieldConfig
            }

          }//end if (authDirective)
        }//end [MapperKind.OBJECT_FIELD]
      })
    }
  }//end return object
}
 
function getUser(token: string) {
  const roles = ['UNKNOWN', 'USER', 'REVIEWER', 'ADMIN']
  return {
    hasRole: (role: string) => {
      const tokenIndex = roles.indexOf(token)
      const roleIndex = roles.indexOf(role)
      return roleIndex >= 0 && tokenIndex >= roleIndex
    }
  }
}
 
const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth', getUser)