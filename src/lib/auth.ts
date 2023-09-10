import { z } from "zod";
import { database } from "../lib/database";
import { timingSafeEqual } from "crypto";

const adminSchema = z.object({
    username: z.string(),
    hashedPassword: z.string(),
});
