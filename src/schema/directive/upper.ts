import { MapperKind, getDirective, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from "graphql";

export function upperDirectiveWithDef(directiveName: string){
  return {
    upperDirectiveTypeDefs:`directive @${directiveName} on FIELD_DEFINITION`,
    upperDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema{
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: fieldConfig => {

          const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0]
          if (upperDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig
            return {
              ...fieldConfig,
              resolve: async function (source, args, context, info) {
                const result = await resolve(source, args, context, info)
                if (typeof result === 'string') {
                  return result.toUpperCase()
                }
                return result
              }
            }
          }
          return fieldConfig
        }
      })
    }
  }
}