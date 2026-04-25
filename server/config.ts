import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  OTP_PEPPER: z.string().min(16),
  API_PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  NODE_ENV: z.string().optional(),
});

export const serverEnv = envSchema.parse(process.env);
export const isProduction = serverEnv.NODE_ENV === "production";
