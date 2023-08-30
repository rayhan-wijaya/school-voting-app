import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";

const organizationMemberSchema = z.object({
    id: z.number(),
    pairId: z.number(),
    nickname: z.string(),
    fullName: z.string(),
    position: z.enum(["chairman", "vice_chairman"]),
});

type OrganizationMember = z.infer<typeof organizationMemberSchema>;

async function filterSuccesses<T>(promiseResults: PromiseSettledResult<T>[]) {
    return promiseResults
        .filter(function (result): result is PromiseFulfilledResult<T> {
            return result.status === "fulfilled";
        })
        .map(function (result) {
            return result.value;
        });
}

async function getOrganizationIdFromPairId(pairId: number) {
    return new Promise<number>(function (resolve, reject) {
        database.pool.query(
            {
                sql: `
                    SELECT
                        organization_id as organizationId
                    FROM organization_pair
                    WHERE id = ?;
                `,
                values: [pairId],
            },
            function (error, results, _fields) {
                if (error) {
                    return reject(error);
                }

                return resolve(results?.[0]?.organizationId);
            }
        );
    });
}

async function getOrganizationName(id: number) {
    return new Promise<string>(function (resolve, reject) {
        database.pool.query(
            {
                sql: "SELECT name FROM organization where id = ?",
                values: [id],
            },
            function (error, results, _fields) {
                if (error) {
                    return reject(error);
                }

                return resolve(results?.[0]?.name);
            }
        );
    });
}

async function getAllMembers() {
    type MembersResponse = { [organizationName: string]: OrganizationMember[] };

    return new Promise<MembersResponse>(function (resolve, reject) {
        database.pool.query(
            `
                SELECT
                    id,
                    pair_id as pairId,
                    nickname,
                    full_name as fullName,
                    position
                FROM organization_member;
            `,
            async function (error, results, _fields) {
                if (error) {
                    return reject(error);
                }

                if (!Array.isArray(results)) {
                    return reject("`results` wasn't an array");
                }

                const members = await filterSuccesses(
                    await Promise.allSettled(
                        results.map(async function (result) {
                            return organizationMemberSchema.parseAsync(result);
                        })
                    )
                );

                const organizationIds = Array.from(
                    new Set(
                        await filterSuccesses(
                            await Promise.allSettled(
                                members.map(function (member) {
                                    return getOrganizationIdFromPairId(
                                        member.pairId
                                    );
                                })
                            )
                        )
                    )
                );

                const organizations = await filterSuccesses(
                    await Promise.allSettled(
                        organizationIds.map(async function (organizationId) {
                            return {
                                id: organizationId,
                                name: await getOrganizationName(organizationId),
                            };
                        })
                    )
                );

                const response = {} as MembersResponse;

                for (const organization of organizations) {
                    const organizationMembers = [] as typeof members;

                    for (const member of members) {
                        const organizationId =
                            await getOrganizationIdFromPairId(member.pairId);

                        if (organizationId !== organization.id) {
                            continue;
                        }

                        organizationMembers.push(member);
                    }

                    const distinctPairIds = Array.from(
                        new Set(
                            organizationMembers.map(function (
                                organizationMember
                            ) {
                                return organizationMember.pairId;
                            })
                        )
                    );

                    response[organization.name] = organizationMembers;
                }

                return resolve(response);
            }
        );
    });
}

async function handleGet(_request: NextApiRequest, response: NextApiResponse) {
    const members = await getAllMembers();

    return response.status(200).json(members);
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

export type OrganizationMembers = ReturnType<typeof getAllMembers>;
