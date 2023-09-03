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
