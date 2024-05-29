// ${require("./enum")}
// ${require("./scalar")}
// ${require("./input")}
// ${require("./type")}
// ${require("./mutation")}
// ${require("./query")}

//console.log(import('./scalar'))
import Enum from "./enum"
import Input from "./input"
import Interface from "./interface"
import Mutation from "./mutation"
import Query from "./query"
import Scalar from './scalar'
import Subscription from "./subscription"
import Types from "./types"

export default `#graphql
  ${Interface}
  ${Enum}
  ${Scalar}
  ${Input}
  ${Types}
  ${Subscription}
  ${Mutation}
  ${Query}
`