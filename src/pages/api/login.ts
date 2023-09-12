import type { NextApiRequest, NextApiResponse } from "next";
import type { PoolConnection } from "mysql";
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
    connection,
}: {
    username: string;
    hashedPassword: string;
    isValidateCredentials: boolean;
    connection: PoolConnection;
}) {
    return new Promise<string>(async function (resolve, reject) {
        if (
            isValidateCredentials &&
            !(await validateCredentials({
                username,
                hashedPassword,
                connection,
            }))
        ) {
            return reject("Invalid credentials");
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

        return resolve(newId);
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

    const { areCredentialsInvalid, isSuccessful } = await new Promise<{
        areCredentialsInvalid: boolean;
        isSuccessful: boolean;
    }>(function (resolve, reject) {
        database.pool.getConnection(async function (error, connection) {
            if (error) {
                return reject(error);
            }

            const validateCredentialsResult = await validateCredentials({
                username,
                hashedPassword,
                connection,
            });

            if (!validateCredentialsResult) {
                connection.release();

                return resolve({
                    areCredentialsInvalid: true,
                    isSuccessful: false,
                });
            }

            try {
                const sessionToken = await createSession({
                    username,
                    hashedPassword,
                    connection,
                    isValidateCredentials: false,
                });

                response.setHeader(
                    "Set-Cookie",
                    cookie.serialize("admin_session_token", sessionToken, {
                        path: "/",
                    })
                );
            } catch (error) {
                console.error(error);

                connection.release();

                return resolve({
                    areCredentialsInvalid: false,
                    isSuccessful: false,
                });
            }

            connection.release();

            return resolve({
                areCredentialsInvalid: false,
                isSuccessful: true,
            });
        });
    });

    if (isSuccessful) {
        return response.status(200).send({ message: "OK" });
    }

    if (areCredentialsInvalid) {
        return response
            .status(400)
            .send({ error: "Invalid username or password" });
    }

    return response
        .status(500)
        .send({ error: "Internal server error, something went wrong" });
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
