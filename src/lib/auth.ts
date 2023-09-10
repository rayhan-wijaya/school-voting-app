import { z } from "zod";
import { database } from "../lib/database";
import { timingSafeEqual } from "crypto";

const adminSchema = z.object({
    username: z.string(),
    hashedPassword: z.string(),
});

export function validateCredentials(authToken: string) {
    const [username, hashedPassword] = authToken.split(":");

    return new Promise<boolean>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

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
                        return reject("Failed to validate admin results");
                    }

                    if (!adminsResult.data[0]) {
                        return reject("Failed to get an admin from DB");
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

            return connection.release();
        });
    });
}
