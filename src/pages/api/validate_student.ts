import { PoolConnection } from "mysql";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";

function hasStudentVoted({
    connection,
    studentId,
}: {
    connection: PoolConnection;
    studentId: number;
}) {
    return new Promise<boolean>(function (resolve, reject) {
        connection.query(
            {
                sql: "SELECT id FROM vote WHERE student_id = ?",
                values: [studentId],
            },
            function (error, results, _fields) {
                if (error) {
                    return reject(error);
                }

                if (!Array.isArray(results)) {
                    return reject("`results` wasn't an array");
                }

                return resolve(results.length > 0);
            }
        );
    });
}

async function handleGet(request: NextApiRequest, response: NextApiResponse) {
    const parsedQuery = await z
        .object({ studentId: z.string() })
        .safeParseAsync(request.query);

    if (!parsedQuery.success) {
        return response.status(400).json({
            error: parsedQuery.error.issues,
        });
    }

    const { studentId } = parsedQuery.data;

    const hasStudentVotedResult = await new Promise<boolean>(function (
        resolve,
        reject
    ) {
        database.pool.getConnection(async function (error, connection) {
            if (error) {
                return reject(error);
            }

            return resolve(
                await hasStudentVoted({
                    connection,
                    studentId: Number(studentId),
                })
            );
        });
    });

    if (hasStudentVotedResult) {
        return response.status(400).json({
            error: "You already voted",
        });
    }

    return response.status(200).json({
        message: "OK",
    });
}
