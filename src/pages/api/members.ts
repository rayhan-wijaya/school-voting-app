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
