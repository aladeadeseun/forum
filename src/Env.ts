import { z } from "zod";

export default z.object({
  PORT:z.coerce.number().lte(9000).gte(80),
  NODE_ENV:z.enum(["test", "development", "stage", "production"])
})
