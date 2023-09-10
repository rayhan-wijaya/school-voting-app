import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { database } from "~/lib/database";
import { validateCredentials } from "~/lib/auth";
import { createId } from "~/lib/cuid";
import { createHash } from "crypto";
import { z } from "zod";

function createSession({
    username,
    hashedPassword,
    isValidateCredentials = true,
}: {
    username: string;
    hashedPassword: string;
    isValidateCredentials: boolean;
}) {
    return new Promise<string>(async function (resolve, reject) {
        if (
            isValidateCredentials &&
            !(await validateCredentials({ username, hashedPassword }))
        ) {
            return reject("Invalid credentials");
        }

        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            const newId = createId();

            connection.query(
                {
                    sql: `
                        INSERT INTO
                            \`admin_session\` (\`admin_id\`, \`token\`)
                        VALUES
                            ((SELECT \`id\` FROM \`admin\` WHERE \`username\` = ?), ?);
                    `,
                    values: [username, newId],
                },
                function (error) {
                    if (error) {
                        return reject(error);
                    }
                }
            );

            connection.release();

            return resolve(newId);
        });
    });
}

const bodySchema = z.object({
    username: z.string(),
    password: z.string(),
});

async function handlePost(request: NextApiRequest, response: NextApiResponse) {
    const body = JSON.parse(request.body);
    const parsedBodyResult = await bodySchema.safeParseAsync(body);

    if (!parsedBodyResult.success) {
        return response
            .status(400)
            .send({ error: parsedBodyResult.error.issues });
    }

    const { username, password } = parsedBodyResult.data;
    const hashedPassword = createHash("sha256").update(password).digest("hex");

    if (!(await validateCredentials({ username, hashedPassword }))) {
        return response
            .status(400)
            .send({ error: "Invalid username or password" });
    }

    try {
        const sessionToken = await createSession({
            username,
            hashedPassword,
            isValidateCredentials: false,
        });

        response.setHeader(
            "Set-Cookie",
            cookie.serialize("admin_session_token", sessionToken)
        );
    } catch (error) {
        console.error(error);

        return response
            .status(500)
            .send({ error: "Internal server error, something went wrong" });
    }

    return response.status(200).send({ message: "OK" });
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "POST":
            return await handlePost(request, response);
        default:
            return response
                .status(501)
                .json({ message: "Unimplemented method" });
    }
}
