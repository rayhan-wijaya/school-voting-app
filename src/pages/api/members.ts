import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";

const organizationMemberSchema = z.object({
    id: z.number(),
    organizationId: z.number(),
    pairId: z.number(),
    nickname: z.string(),
    fullName: z.string().nullable().optional(),
    position: z.enum(["chairman", "vice_chairman"]),
    imageFileName: z.string().nullable().optional(),
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

async function getOrganizationName(id: number) {
    return new Promise<string>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            connection.query(
                {
                    sql: "SELECT name, full_name as fullName FROM organization where id = ?",
                    values: [id],
                },
                function (error, results, _fields) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(`${results?.[0]?.fullName}<br>(${results?.[0]?.name})`);
                }
            );

            return connection.release();
        });
    });
}

async function getAllMembers() {
    type MembersResponse = {
        [organizationName: string]: {
            [organizationPairId: string]: OrganizationMember[];
        };
    };

    return new Promise<MembersResponse>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

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
                                return organizationMemberSchema.parseAsync(
                                    result
                                );
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
                            organizationIds.map(async function (
                                organizationId
                            ) {
                                return {
                                    id: organizationId,
                                    name: await getOrganizationName(
                                        organizationId
                                    ),
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

                        response[organization.name] =
                            grouppedOrganizationMembers;
                    }

                    return resolve(response);
                }
            );

            return connection.release();
        });
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
