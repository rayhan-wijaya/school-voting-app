import type { NextApiRequest, NextApiResponse } from "next";
import type { PoolConnection } from "mysql";
import { z } from "zod";
import { database } from "~/lib/database";
import { voteSchema, votingResultSchema } from "~/lib/schemas";

type Vote = z.infer<typeof voteSchema>;

async function getVotes(connection: PoolConnection) {
    return new Promise<Vote[]>(function (resolve, reject) {
        connection.query(
            {
                sql: `
                    SELECT
                        \`id\`,
                        \`student_id\` as studentId,
                        \`organization_id\` as organizationId,
                        \`pair_id\` as pairId
                    FROM vote;
                `,
                values: [],
            },
            async function (error, results) {
                if (error) {
                    return reject(error);
                }

                const votesResult = await z
                    .array(voteSchema)
                    .safeParseAsync(results);

                if (!votesResult.success) {
                    return reject("Error while parsing result from db");
                }

                return resolve(votesResult.data);
            }
        );
    });
}

const voteCountDetailSchema = z.object({
    organizationId: z.number(),
    pairId: z.number(),
    voteCount: z.number(),
    imageFileName: z.string(),
});

async function getVoteCountDetails(connection: PoolConnection) {
    return new Promise<z.infer<typeof voteCountDetailSchema>[]>(function (
        resolve,
        reject
    ) {
        connection.query(
            {
                sql: `
                    select
                        organization_id as organizationId,
                        pair_id as pairId,
                        count(*) as voteCount,
                        (SELECT image_file_name from organization_pair where organization_id = organizationId and pair_id = pairId) as imageFileName
                    from vote
                    group by organization_id, pair_id;
                `,
            },
            async function (error, results) {
                if (error) {
                    return reject(error);
                }

                const voteCountDetailsResult = await z
                    .array(voteCountDetailSchema)
                    .safeParseAsync(results);

                if (!voteCountDetailsResult.success) {
                    return reject("Failed to parse result from DB");
                }

                return resolve(voteCountDetailsResult.data);
            }
        );
    });
}

type VotingResult = z.infer<typeof votingResultSchema>;

async function getVotingResults(connection: PoolConnection) {
    const votingResults = {} as { [organizationId: string]: VotingResult[] };
    const votes = await getVotes(connection);
    const voteCountDetails = await getVoteCountDetails(connection);
    const distinctOrganizationIds = Array.from(
        new Set(
            votes.map(function (vote) {
                return vote.organizationId;
            })
        )
    );

    for (const organizationId of distinctOrganizationIds) {
        const organizationVotes = votes.filter(function (vote) {
            return vote.organizationId === organizationId;
        });

        const totalVoteCount = organizationVotes.length;

        const distinctPairIds = Array.from(
            new Set(
                organizationVotes.map(function (vote) {
                    return vote.pairId;
                })
            )
        );

        const organizationVotingResults = distinctPairIds.map(function (
            pairId
        ) {
            const voteCountDetail = voteCountDetails.find(function (
                voteCountDetail
            ) {
                return (
                    voteCountDetail.organizationId === organizationId &&
                    voteCountDetail.pairId === pairId
                );
            });

            return {
                imageFileName: voteCountDetail?.imageFileName,
                percentage:
                    ((voteCountDetail?.voteCount ?? 0) / totalVoteCount) * 100,
                voteCount: voteCountDetail?.voteCount,
                pairId,
                organizationId,
                totalVoteCount,
            };
        }) as VotingResult[];

        votingResults[organizationId] = organizationVotingResults;
    }

    return votingResults;
}

async function handleGet(request: NextApiRequest, response: NextApiResponse) {
    const votingResults = await new Promise(function (resolve, reject) {
        database.pool.getConnection(async function (error, connection) {
            if (error) {
                return reject(error);
            }

            return resolve(await getVotingResults(connection));
        });
    });

    return response.status(200).send(votingResults);
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
