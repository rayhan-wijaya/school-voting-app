import { NextApiRequest, NextApiResponse } from "next";
import { isAuthValid } from "~/lib/auth";
import { z } from "zod";

const numericString = z
    .string()
    .regex(/^\d+$/)
    .transform(function (value) {
        return Number(value);
    });

const getValidatePasswordQuerySchema = z.object({
    studentId: z.union([numericString, z.number()]).transform(function (value) {
        return Number(value);
    }),
    password: z.string(),
});

async function handleGet(request: NextApiRequest, response: NextApiResponse) {
    console.log(request.query);

    const parsedQuery = await getValidatePasswordQuerySchema.safeParseAsync(
        request.query
    );

    if (!parsedQuery.success) {
        return response.status(400).json({ error: parsedQuery.error.issues });
    }

    if (
        !(await isAuthValid({
            studentId: parsedQuery.data.studentId,
            requestedPassword: parsedQuery.data.password,
        }))
    ) {
        return response.status(400).json({ error: "Incorrect password" });
    }

    return response.status(200).json({ message: "OK" });
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
