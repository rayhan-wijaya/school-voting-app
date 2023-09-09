import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    client: {
        NEXT_PUBLIC_BASE_URL: z.string(),
        NEXT_PUBLIC_CDN_BASE_URL: z.string(),
    },
    server: {
        DATABASE_HOST: z.string(),
        DATABASE_USER: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_URL,
        DATABASE_HOST: process.env.DATABASE_HOST,
        DATABASE_USER: process.env.DATABASE_USER,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        DATABASE_NAME: process.env.DATABASE_NAME,
    },
});
