import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_HOST: z.string(),
        DATABASE_USER: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),
    },
    runtimeEnvStrict: {
        DATABASE_HOST: process.env.DATABASE_HOST,
        DATABASE_USER: process.env.DATABASE_USER,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        DATABASE_NAME: process.env.DATABASE_NAME,
    },
});
