import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";

const organizationMemberSchema = z.object({
    id: z.number(),
    organizationId: z.number(),
    nickname: z.string(),
    fullName: z.string(),
    position: z.enum(["chairman", "vice_chairman"]),
});

type OrganizationMember = z.infer<typeof organizationMemberSchema>;

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
                    organization_id as organizationId,
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

                const memberResults = await Promise.allSettled(
                    results.map(async function (result) {
                        return organizationMemberSchema.parseAsync(result);
                    })
                );

                const members = memberResults
                    .filter(function (
                        memberResult
                    ): memberResult is PromiseFulfilledResult<OrganizationMember> {
                        return memberResult.status === "fulfilled";
                    })
                    .map(function (memberResult) {
                        return memberResult.value;
                    });

                const organizationIds = Array.from(
                    new Set(
                        members.map(function (member) {
                            return member.organizationId;
                        })
                    )
                );

                const organizations = await Promise.all(
                    organizationIds.map(async function (organizationId) {
                        return {
                            id: organizationId,
                            name: await getOrganizationName(organizationId),
                        };
                    })
                );

                const response = {} as MembersResponse;

                for (const organization of organizations) {
                    const organizationMembers = members.filter(function (
                        member
                    ) {
                        return member.organizationId === organization.id;
                    });

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
