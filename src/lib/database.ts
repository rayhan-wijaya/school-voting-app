import { PoolConnection, createPool } from "mysql";
import { env } from "./env";

export const database = {
    pool: createPool({
        connectionLimit: 2000,
        host: env.DATABASE_HOST,
        user: env.DATABASE_USER,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_NAME,
    }),
};

const cachedOrganizationNames = new Map<number, string>();

function getFormattedOrganizationName({
    id,
    connection,
    isFromCache = false,
}: {
    id: number;
    connection: PoolConnection;
    isFromCache: boolean;
}) {
    if (isFromCache && cachedOrganizationNames.has(id)) {
        return cachedOrganizationNames.get(id);
    }

    return new Promise<string>(function (resolve, reject) {
        connection.query(
            {
                sql: "SELECT name, full_name as fullName FROM organization where id = ?",
                values: [id],
            },
            function (error, results, _fields) {
                if (error) {
                    return reject(error);
                }

                return resolve(
                    `${results?.[0]?.fullName}<br>(${results?.[0]?.name})`
                );
            }
        );
    });
}
