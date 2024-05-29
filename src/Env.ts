import { z } from "zod";

export default z.object({
  PORT:z.coerce.number().lte(9000).gte(80),
  NODE_ENV:z.enum(["test", "development", "stage", "production"]),
  REDIS_URL:z.string(),
  MONGO_URI:z.string().url(),
  SESS_REFRESH_TOKEN_EXPIRE_IN:z.coerce.number(),
  SESS_ACCESS_TOKEN_EXPIRE_IN:z.coerce.number(),
  SESS_NAME:z.string(),
  SALT_ROUND:z.coerce.number(),
  SESS_SECRET_TOKEN:z.string(),
})
