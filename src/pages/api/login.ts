import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "~/lib/database";
import { validateCredentials } from "~/lib/auth";
import { createId } from "~/lib/cuid";
import { z } from "zod";
