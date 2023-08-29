import { createPool } from "mysql";
import { env } from "./env";

export const database = {
    pool: createPool({
        connectionLimit: 10,
        host: env.DATABASE_HOST,
        user: env.DATABASE_USER,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_NAME,
    }),
};
