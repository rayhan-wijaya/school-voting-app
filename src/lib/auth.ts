import { z } from "zod";
import { createHash, timingSafeEqual } from "crypto";
import { database } from "./database";

const passwordResultsSchema = z.array(
    z.object({
        hashedPassword: z.string(),
    })
);

export async function isAuthValid({
    studentId,
    requestedPassword,
}: {
    studentId: string | number;
    requestedPassword: string;
}) {
    return new Promise<boolean>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            connection.query(
                {
                    sql: "SELECT hashed_password as hashedPassword FROM student WHERE id = ?",
                    values: [studentId],
                },
                function (error, results, _fields) {
                    if (error) {
                        return reject(error);
                    }

                    const parsedResults =
                        passwordResultsSchema.safeParse(results);

                    if (!parsedResults.success) {
                        return reject(parsedResults.error);
                    }

                    const firstResult = parsedResults.data[0];
                    const hashedRequestedPassword = Buffer.from(
                        createHash("sha256")
                            .update(requestedPassword)
                            .digest("hex")
                    );
                    const hashedOriginalPassword = Buffer.from(
                        firstResult.hashedPassword
                    );

                    return resolve(
                        timingSafeEqual(
                            hashedRequestedPassword,
                            hashedOriginalPassword
                        )
                    );
                }
            );

            return connection.release();
        });
    });
}
