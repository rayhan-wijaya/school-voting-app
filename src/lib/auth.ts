import { z } from "zod";
import { createHash, timingSafeEqual } from "crypto";
import { database } from "./database";

const passwordResultsSchema = z.array(
    z.object({
        password: z.string(),
    })
);
