import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";
import { filterSuccesses } from "~/lib/promises";
import { voteSchema } from "~/lib/schemas";

type Vote = z.infer<typeof voteSchema>;

async function getVotes() {
    return new Promise<Vote[]>(function (resolve, reject) {
        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            connection.query(
                {
                    sql: "",
                    values: [],
                },
                async function (error, results) {
                    if (error) {
                        return reject(error);
                    }

                    const votesResult = await z
                        .array(voteSchema)
                        .safeParseAsync(results);

                    if (!votesResult.success) {
                        return reject("Error while parsing result from db");
                    }

                    return resolve(votesResult.data);
                }
            );
        });
    });
}
