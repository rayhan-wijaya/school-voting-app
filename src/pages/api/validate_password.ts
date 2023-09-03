import { NextApiRequest, NextApiResponse } from "next";
import { isAuthValid } from "~/lib/auth";
import { z } from "zod";

const numericString = z
    .string()
    .regex(/^\d+$/)
    .transform(function (value) {
        return Number(value);
    });
