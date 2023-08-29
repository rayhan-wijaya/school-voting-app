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

async function getAllMembers() {
    return new Promise<OrganizationMember[]>(function (resolve, reject) {
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

                return resolve(members);
            }
        );
    });
}
