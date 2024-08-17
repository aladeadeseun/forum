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
  MAX_PIN_REG:z.coerce.number().lte(6).gte(3),
  MAX_PIN_REG_WAIT_TIME:z.coerce.number(),
  MAIL_SERVICE:z.string(),
  MAIL_USERNAME:z.string(),
  MAIL_PASS:z.string(),
  FROM_MAIL:z.string(),
  OTP_EXPIRY_IN_MIN:z.coerce.number(),
  SAVE_COMMENT_IMAGE_EXPIRY:z.coerce.number(),
  FETCH_QUERY_LIMIT:z.coerce.number(),
})
