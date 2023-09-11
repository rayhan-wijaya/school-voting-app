import type { NextApiRequest, NextApiResponse } from "next";
import type { PoolConnection } from "mysql";
import { z } from "zod";
import { database } from "~/lib/database";
import { votingResultSchema } from "~/lib/schemas";

type VotingResult = z.infer<typeof votingResultSchema>;

async function getVotingResults(connection: PoolConnection) {
    return new Promise<VotingResult[]>(function (resolve, reject) {
        connection.query(
            {
                sql: `
                    select
                        organization_id as organizationId,
                        pair_id as pairId,
                        image_file_name as imageFileName,
                        (
                            select count(*)
                            from vote
                            where organization_id = organizationId and pair_id = pairId
                        ) as voteCount,
                        (
                            select count(*)
                            from vote
                            where organization_id = organizationId
                        ) as totalVoteCount,
                        (
                            (
                                select count(*)
                                from vote
                                where organization_id = organizationId and pair_id = pairId
                            ) /
                            (
                                select count(*)
                                from vote
                                where organization_id = organizationId
                            ) * 100
                        ) as percentage
                    from organization_pair;  
                `,
                values: [],
            },
            async function (error, results) {
                if (error) {
                    return reject(error);
                }

                const parsedVotingResult = await z
                    .array(votingResultSchema)
                    .safeParseAsync(results);

                if (!parsedVotingResult.success) {
                    return reject("Error while parsing result from db");
                }

                return resolve(parsedVotingResult.data);
            }
        );
    });
}

async function handleGet(request: NextApiRequest, response: NextApiResponse) {
    const votingResults = await new Promise<
        Awaited<ReturnType<typeof getVotingResults>>
    >(function (resolve, reject) {
        database.pool.getConnection(async function (error, connection) {
            if (error) {
                return reject(error);
            }

            return resolve(await getVotingResults(connection));
        });
    });

    const finalVotingResults = {} as {
        [organizationId: number]: VotingResult[];
    };
    const distinctOrganizationIds = Array.from(
        new Set(
            votingResults.map(function (votingResult) {
                return votingResult.organizationId;
            })
        )
    );

    for (const organizationId of distinctOrganizationIds) {
        finalVotingResults[organizationId] = votingResults.filter(function (
            votingResult
        ) {
            return votingResult.organizationId === organizationId;
        });
    }

    return response.status(200).send(finalVotingResults);
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "GET":
            return await handleGet(request, response);
        default:
            return response
                .status(501)
                .json({ message: "Unimplemented method" });
    }
}
