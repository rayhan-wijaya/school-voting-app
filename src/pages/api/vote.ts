import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const numericString = z
    .string()
    .regex(/^\d+$/)
    .transform(function (value) {
        return Number(value);
    });

const postVotingQuerySchema = z.object({
    studentId: numericString,
    organizationMemberIds: z.union([numericString, z.array(numericString)]),
});

async function handlePost(request: NextApiRequest, response: NextApiResponse) {
    const parsedQuery = await postVotingQuerySchema.safeParseAsync(
        request.query
    );

    if (!parsedQuery.success) {
        return response.status(400).json({ error: parsedQuery.error.issues });
    }

    const organizationMemberIds = Array.isArray(
        parsedQuery.data.organizationMemberIds
    )
        ? parsedQuery.data.organizationMemberIds
        : [parsedQuery.data.organizationMemberIds];

    for (const memberId of organizationMemberIds) {
        database.pool.query(
            {
                sql: `
                        INSERT INTO
                            \`vote\` (\`student_id\`, \`organization_member_id\`)
                        VALUES
                            (?, ?);
                    `,
                values: [parsedQuery.data.studentId, memberId],
            },
            function (error) {
                if (error) {
                    console.error(error);
                }
            }
        );
    }

    return response.status(200).send();
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
