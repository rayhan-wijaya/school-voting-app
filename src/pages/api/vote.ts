import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database, hasStudentVoted } from "~/lib/database";

const numericString = z.union([
    z
        .string()
        .regex(/^\d+$/)
        .transform(function (value) {
            return Number(value);
        }),
    z.number(),
]);

const organizationPairSchema = z.object({
    organizationId: numericString,
    pairId: numericString,
});

const postVotingBodySchema = z.object({
    studentId: z.union([numericString, z.number()]).transform(function (value) {
        return Number(value);
    }),
    organizationPairs: z.array(organizationPairSchema),
});

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

    const organizationPairs = Array.isArray(parsedBody.data.organizationPairs)
        ? parsedBody.data.organizationPairs
        : [parsedBody.data.organizationPairs];

    for (const organizationPair of organizationPairs) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return;
            }

            connection.query(
                {
                    sql: `
                        INSERT INTO
                            \`vote\` (\`student_id\`, \`organization_id\`, \`pair_id\`)
                        VALUES
                            (?, ?, ?);
                    `,
                    values: [
                        parsedBody.data.studentId.toString(),
                        organizationPair.organizationId,
                        organizationPair.pairId,
                    ],
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
