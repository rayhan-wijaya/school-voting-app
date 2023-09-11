import { useQuery } from "@tanstack/react-query";
import { env } from "~/lib/env";
import type { VotingResults } from "../api/admin/results";

async function fetchVotingResults() {
    const response = await fetch(
        new URL("/api/admin/results", env.NEXT_PUBLIC_BASE_URL)
    );
    const json = (await response.json()) as VotingResults;

    return json;
}
