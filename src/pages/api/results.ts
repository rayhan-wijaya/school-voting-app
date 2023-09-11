import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { database } from "~/lib/database";
import { filterSuccesses } from "~/lib/promises";
import { voteSchema } from "~/lib/schemas";

type Vote = z.infer<typeof voteSchema>;
