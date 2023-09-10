import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "~/lib/database";
import { validateCredentials } from "~/lib/auth";
import { createId } from "~/lib/cuid";
import { z } from "zod";

function getAdminIdFromUsername(username: string) {
    return new Promise<number>(async function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            connection.query(
                {
                    sql: "SELECT id FROM admin WHERE username = ?",
                    values: [username],
                },
                async function (error, results) {
                    if (error) {
                        return reject(error);
                    }

                    const adminIdsResult = await z
                        .array(z.object({ id: z.number() }).optional())
                        .safeParseAsync(results);

                    if (!adminIdsResult.success) {
                        return reject("Failed to parse admin ids from DB");
                    }

                    if (!adminIdsResult.data[0]) {
                        return reject(
                            `An admin with the username ${username} doesn't exist`
                        );
                    }

                    const { id: adminId }  = adminIdsResult.data[0];

                    return resolve(adminId);
                }
            );
        });
    });
}
