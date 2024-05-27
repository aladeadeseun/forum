import { GraphQLScalarType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { Kind } from 'graphql/language';

export default {
  JSON:GraphQLJSON,
  
  DateTime:new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date custom scalar type',
    // value from the client
    parseValue(value: any) {
      return new Date(value);
      //return value;
    },
  
    // value sent to the client
    serialize(value: any) {
      //if date is comming
      if(Object.prototype.toString.call(value) === "[object Date]"){
        return value.getTime();
      }
      //parse date default to string type
      return value;
    },
  
    parseLiteral(ast: any):any {
      //debug(ast);
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};