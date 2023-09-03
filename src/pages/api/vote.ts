import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
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
    organizationPairIds: z.union([numericString, z.array(numericString)]),
});

async function handlePost(request: NextApiRequest, response: NextApiResponse) {
    const parsedBody = await postVotingBodySchema.safeParseAsync(
        JSON.parse(request.body)
    );

    if (!parsedBody.success) {
        console.log(parsedBody.error.issues);
        console.log("query failed to parse :(");

        return response.status(400).json({ error: parsedBody.error.issues });
    }

    console.log(parsedBody.data);

    const organizationPairIds = Array.isArray(
        parsedBody.data.organizationPairIds
    )
        ? parsedBody.data.organizationPairIds
        : [parsedBody.data.organizationPairIds];

    for (const memberId of organizationPairIds) {
        database.pool.query(
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
