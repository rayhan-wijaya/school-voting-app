import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { isAuthValid } from "~/lib/auth";
import { database } from "~/lib/database";

const numericString = z
    .string()
    .regex(/^\d+$/)
    .transform(function (value) {
        return Number(value);
    });

const postVotingBodySchema = z.object({
    studentId: z.union([numericString, z.number()]).transform(function (value) {
        return Number(value);
    }),
    password: z.string(),
    organizationPairIds: z.union([numericString, z.array(numericString)]),
});

async function hasStudentVoted(studentId: number) {
    return new Promise<boolean>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

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

                    return resolve(results.length >= 0);
                }
            );

            return connection.release();
        });
    });
}

async function handlePost(request: NextApiRequest, response: NextApiResponse) {
    const parsedBody = await postVotingBodySchema.safeParseAsync(
        JSON.parse(request.body)
    );

    if (!parsedBody.success) {
        return response.status(400).json({ error: parsedBody.error.issues });
    }

    if (await hasStudentVoted(parsedBody.data.studentId)) {
        return response.status(400).json({ error: "You already voted!" });
    }

    if (
        !(await isAuthValid({
            studentId: parsedBody.data.studentId,
            requestedPassword: parsedBody.data.password,
        }))
    ) {
        return response.status(400).json({ error: "Incorrect password" });
    }


    const organizationPairIds = Array.isArray(
        parsedBody.data.organizationPairIds
    )
        ? parsedBody.data.organizationPairIds
        : [parsedBody.data.organizationPairIds];

    for (const memberId of organizationPairIds) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return;
            }

            connection.query(
                {
                    sql: `
                        INSERT INTO
                            \`vote\` (\`student_id\`, \`pair_id\`)
                        VALUES
                            (?, ?);
                    `,
                    values: [parsedBody.data.studentId, memberId],
                },
                function (error) {
                    if (error) {
                        console.error(error);
                    }
                }
            );

            return connection.release();
        });
    }

    return response.status(200).send({});
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "POST":
            return await handlePost(request, response);
        default:
            return response
                .status(501)
                .json({ message: "Unimplemented method" });
    }
}
