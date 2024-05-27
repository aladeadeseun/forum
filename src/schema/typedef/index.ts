// ${require("./enum")}
// ${require("./scalar")}
// ${require("./input")}
// ${require("./type")}
// ${require("./mutation")}
// ${require("./query")}

//console.log(import('./scalar'))
import Interface from "./interface"
import Query from "./query"
import Scalar from './scalar'
import Subscription from "./subscription"

export default `#graphql
  ${Interface}
  ${Scalar}
  ${Subscription}
  ${Query}
`