import { z } from "zod";

const organizationMemberSchema = z.object({
    id: z.number(),
    organizationId: z.number(),
    pairId: z.number(),
    nickname: z.string(),
    fullName: z.string().nullable().optional(),
    position: z.enum(["chairman", "vice_chairman"]),
    imageFileName: z.string().nullable().optional(),
});


export default organizationMemberSchema;
