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
