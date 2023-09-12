import { z } from "zod";
import { database } from "../lib/database";
import { timingSafeEqual } from "crypto";
import type { PoolConnection } from "mysql";

const adminSchema = z.object({
    username: z.string(),
    hashedPassword: z.string(),
});

export function validateCredentials({
    username,
    hashedPassword,
    connection,
}: {
    username: string;
    hashedPassword: string;
    connection: PoolConnection;
}) {
    return new Promise<boolean>(function (resolve, reject) {
        connection.query(
            {
                sql: `
                    SELECT
                        username,
                        hashed_password as hashedPassword
                    FROM admin
                    WHERE username = ?;
                `,
                values: [username],
            },
            async function (error, results) {
                if (error) {
                    return reject(error);
                }

                const adminsResult = await z
                    .array(adminSchema.optional())
                    .safeParseAsync(results);

                if (!adminsResult.success) {
                    return resolve(false);
                }

                if (!adminsResult.data[0]) {
                    return resolve(false);
                }

                const adminFromDb = adminsResult.data[0];

                return resolve(
                    timingSafeEqual(
                        Buffer.from(adminFromDb.hashedPassword),
                        Buffer.from(hashedPassword)
                    )
                );
            }
        );
    });
}

export function validateSessionToken(token: string) {
    return new Promise<boolean>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            connection.query(
                {
                    sql: "SELECT id FROM admin_session WHERE token = ?",
                    values: [token],
                },
                function (error, results) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(
                        Array.isArray(results) && results.length > 0
                    );
                }
            );

            return connection.release();
        });
    });
}
