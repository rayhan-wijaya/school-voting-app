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

export function getFormattedOrganizationName({
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

export function hasStudentVoted({
    connection,
    studentId,
}: {
    connection: PoolConnection;
    studentId: number;
}) {
    return new Promise<boolean>(function (resolve, reject) {
        connection.query(
            {
                sql: "SELECT id FROM vote WHERE student_id = ?",
                values: [studentId],
            },
            function (error, results, _fields) {
                if (error) {
                    return reject(error);
                }

                if (!Array.isArray(results)) {
                    return reject("`results` wasn't an array");
                }

                return resolve(results.length > 0);
            }
        );
    });
}
