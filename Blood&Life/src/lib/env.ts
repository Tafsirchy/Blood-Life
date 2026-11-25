import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/blood-lagbe"),
  AUTH_SECRET: isProd
    ? z.string().min(32, "AUTH_SECRET must be at least 32 characters in production")
    : z.string().optional(),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.JWT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
