import type { PoolConnection } from "mysql";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";
import { getFormattedOrganizationName } from "~/lib/database";
import { filterSuccesses } from "~/lib/promises";
import { organizationMemberSchema } from "~/lib/schemas";

type OrganizationMember = z.infer<typeof organizationMemberSchema>;

async function getAllMembers(connection: PoolConnection) {
    type MembersResponse = {
        [organizationName: string]: {
            [organizationPairId: string]: OrganizationMember[];
        };
    };

    return new Promise<MembersResponse>(function (resolve, reject) {
        connection.query(
            `
                SELECT
                    id,
                    organization_id as organizationId,
                    pair_id as pairId,
                    nickname,
                    full_name as fullName,
                    position,
                    image_file_name as imageFileName
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
                        members.map(function (member) {
                            return member.organizationId;
                        })
                    )
                );

                const organizations = await filterSuccesses(
                    await Promise.allSettled(
                        organizationIds.map(async function (organizationId) {
                            return {
                                id: organizationId,
                                name: await getFormattedOrganizationName({
                                    connection,
                                    isFromCache: true,
                                    id: organizationId,
                                }),
                            };
                        })
                    )
                );

                const response = {} as MembersResponse;

                for (const organization of organizations) {
                    const organizationMembers = [] as typeof members;

                    for (const member of members) {
                        if (member.organizationId !== organization.id) {
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

                    const grouppedOrganizationMembers = {} as {
                        [pairId: number]: OrganizationMember[];
                    };

                    for (const pairId of distinctPairIds) {
                        const members = organizationMembers
                            .filter(function (member) {
                                return member.pairId === pairId;
                            })
                            .sort(function (memberA, memberB) {
                                if (
                                    memberA.position === "chairman" &&
                                    memberB.position === "vice_chairman"
                                ) {
                                    return -1;
                                }

                                if (
                                    memberA.position === "vice_chairman" &&
                                    memberB.position === "chairman"
                                ) {
                                    return 1;
                                }

                                return 0;
                            });

                        grouppedOrganizationMembers[pairId] = members;
                    }

                    if (!organization.name) {
                        continue;
                    }

                    response[organization.name] = grouppedOrganizationMembers;
                }

                return resolve(response);
            }
        );
    });
}

async function handleGet(_request: NextApiRequest, response: NextApiResponse) {
    const members = await new Promise<
        Awaited<ReturnType<typeof getAllMembers>>
    >(async function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            const membersResult = getAllMembers(connection);

            connection.release();

            return resolve(membersResult);
        });
    });

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
