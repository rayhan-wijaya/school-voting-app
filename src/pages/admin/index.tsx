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

export default function Admin() {
    const { data: votingResults } = useQuery({
        queryKey: ["voting-results"],
        queryFn: fetchVotingResults,
    });

    return (
        <>
            <h1 className="text-center font-semibold text-lg">
                Voting Results
            </h1>

            <div className="p-3" />

            <div className="flex flex-col gap-8">
                {(votingResults ? Object.keys(votingResults) : []).map(
                    function (organizationName) {
                        const organizationVotingResults =
                            votingResults?.[organizationName];

                        return (
                            <div>
                                <h2
                                    className="text-center font-semibold"
                                    dangerouslySetInnerHTML={{
                                        __html: organizationName,
                                    }}
                                />

                                <div className="p-3" />

                                <div className="flex flex-wrap gap-3 items-center justify-center">
                                    {organizationVotingResults
                                        ? organizationVotingResults
                                              .sort(function (
                                                  resultA,
                                                  resultB
                                              ) {
                                                  return (resultA?.percentage ??
                                                      0) >
                                                      (resultB?.percentage ?? 0)
                                                      ? -1
                                                      : 1;
                                              })
                                              .map(function (result) {
                                                  return (
                                                      <div className="p-3 bg-sky-100 rounded-xl">
                                                          <img
                                                              className="rounded-lg w-42 h-32 object-cover"
                                                              src={
                                                                  result.imageFileName
                                                                      ? `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/image/${result.imageFileName}`
                                                                      : ""
                                                              }
                                                          />

                                                          <div className="p-1" />

                                                          <h3 className="text-center">
                                                              {result.name}
                                                          </h3>

                                                          <div className="p-1" />

                                                          <div className="text-center">
                                                              {Math.floor(
                                                                  result.percentage ??
                                                                      0
                                                              )}
                                                              %
                                                          </div>

                                                          <div className="p-1" />

                                                          <div className="text-center">
                                                              <span className="font-semibold">
                                                                  {
                                                                      result.voteCount
                                                                  }{" "}
                                                                  vote
                                                                  {result.voteCount >
                                                                      1 ||
                                                                  result.voteCount ===
                                                                      0
                                                                      ? "s"
                                                                      : ""}
                                                              </span>{" "}
                                                              out of{" "}
                                                              {
                                                                  result.totalVoteCount
                                                              }
                                                          </div>
                                                      </div>
                                                  );
                                              })
                                        : null}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </>
    );
}
