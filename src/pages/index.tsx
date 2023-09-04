import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { OrganizationMembers } from "~/pages/api/members";
import { env } from "~/lib/env";
import { RadioGroup } from "@headlessui/react";

async function voteOrganizationPairs({
    studentId,
    organizationPairs,
}: {
    studentId: number;
    organizationPairs: OrganizationPair[];
}) {
    return await fetch("/api/vote?", {
        body: JSON.stringify({
            studentId,
            organizationPairs: organizationPairs.map(function (
                organizationPair
            ) {
                return {
                    organizationId: organizationPair.organizationId,
                    pairId: organizationPair.pairId,
                };
            }),
        }),
        method: "POST",
        cache: "no-cache",
        next: {
            revalidate: 3000,
        },
    });
}

async function getOrganizationMembers() {
    const response = await fetch(
        new URL("/api/members", env.NEXT_PUBLIC_BASE_URL)
    );
    return await (response.json() as OrganizationMembers);
}

async function getPasswordValidation({
    studentId,
    password,
}: {
    studentId: number;
    password: string;
}) {
    const response = await fetch(
        new URL(
            `/api/validate_password?studentId=${studentId}&password=${password}`,
            env.NEXT_PUBLIC_BASE_URL
        )
    );

    return response.status === 200;
}

function StudentDetailsPage({
    studentId,
    setStudentId,
    studentPassword,
    setStudentPassword,
}: {
    studentId: number | undefined;
    setStudentId: React.Dispatch<React.SetStateAction<number | undefined>>;
    studentPassword: string | undefined;
    setStudentPassword: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
}) {
    return (
        <>
            <h1 className="text-center font-semibold">Welcome!</h1>

            <div className="p-1" />

            <p className="text-center">
                Before we get started, please put in your student details
            </p>

            <div className="p-3" />

            <label className="flex flex-col gap-2">
                <span className="font-semibold">Student ID</span>
                <input
                    type="number"
                    className="bg-gray-100 rounded-xl p-3"
                    placeholder="Your student ID here"
                    value={studentId}
                    onChange={function (event) {
                        setStudentId(event.target.valueAsNumber);
                    }}
                />
            </label>

            <div className="p-3" />

            <label className="flex flex-col gap-2">
                <span className="font-semibold">Password</span>
                <input
                    type="password"
                    className="bg-gray-100 rounded-xl p-3"
                    placeholder="Your student password here"
                    value={studentPassword}
                    onChange={function (event) {
                        setStudentPassword(event.target.value);
                    }}
                />
            </label>
        </>
    );
}

type OrganizationPair = {
    organizationPairCompositeId: string;
    organizationId: number;
    pairId: number;
};

type OrganizationPairs = { [organizationName: string]: OrganizationPair };

function VotePage({
    members,
    setOrganizationPairs,
}: {
    members: Awaited<OrganizationMembers> | undefined;
    setOrganizationPairs: React.Dispatch<
        React.SetStateAction<OrganizationPairs>
    >;
}) {
    const organizationNames = members ? Object.keys(members) : [];

    return (
        <div>
            <div>
                <h1 className="text-center font-semibold">
                    Pick your Vote for Each Organization
                </h1>

                <div className="p-2" />

                <p className="text-center">Please cast your votes</p>
            </div>

            <div className="p-6" />

            <div className="flex flex-col gap-16">
                {members
                    ? organizationNames.map(function (organizationName) {
                          const organizationPairs = members[organizationName];
                          const pairIds = Object.keys(organizationPairs);

                          return (
                              <div key={organizationName}>
                                  <h2 className="font-semibold text-center">
                                      {organizationName}
                                  </h2>

                                  <div className="p-3" />

                                  <RadioGroup
                                      by={"organizationPairCompositeId"}
                                      onChange={function (
                                          pair: OrganizationPair
                                      ) {
                                          setOrganizationPairs(function (
                                              prevPairs
                                          ) {
                                              return {
                                                  ...prevPairs,
                                                  [organizationName]: pair,
                                              };
                                          });
                                      }}
                                  >
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                          {pairIds.map(function (pairId) {
                                              const pair =
                                                  organizationPairs[pairId];

                                              return (
                                                  <RadioGroup.Option
                                                      className="focus:outline-none ui-checked:bg-gray-500 bg-gray-100 rounded-xl ui-checked:text-white cursor-pointer ui-active:ring-4 ui-active:ring-gray-400 shadow-md"
                                                      key={`${pair[0].organizationId}-${pairId}`}
                                                      value={
                                                          {
                                                              organizationPairCompositeId: `${pair[0].organizationId}-${pairId}`,
                                                              pairId: Number(
                                                                  pairId
                                                              ),
                                                              organizationId:
                                                                  Number(
                                                                      pair[0]
                                                                          .organizationId
                                                                  ),
                                                          } as OrganizationPair
                                                      }
                                                  >
                                                      <div className="p-1">
                                                          <svg
                                                              xmlns="http://www.w3.org/2000/svg"
                                                              fill="none"
                                                              viewBox="0 0 24 24"
                                                              strokeWidth={1.5}
                                                              stroke="currentColor"
                                                              className="w-6 h-6 hidden ui-not-checked:block"
                                                          >
                                                              <path
                                                                  strokeLinecap="round"
                                                                  strokeLinejoin="round"
                                                                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                              />
                                                          </svg>

                                                          <svg
                                                              xmlns="http://www.w3.org/2000/svg"
                                                              viewBox="0 0 24 24"
                                                              fill="currentColor"
                                                              className="w-6 h-6 hidden ui-checked:block"
                                                          >
                                                              <path
                                                                  fillRule="evenodd"
                                                                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5a.75.75 0 000-1.5H9a.75.75 0 000 1.5h6z"
                                                                  clipRule="evenodd"
                                                              />
                                                          </svg>
                                                      </div>

                                                      <div className="flex flex-col gap-3 ui-checked:divide-gray-600 divide-y">
                                                          {pair.map(function (
                                                              member
                                                          ) {
                                                              return (
                                                                  <div
                                                                      className="p-5"
                                                                      key={`${member.organizationId}-${member.nickname}`}
                                                                  >
                                                                      <h3 className="font-semibold">
                                                                          {
                                                                              member.fullName
                                                                          }
                                                                      </h3>
                                                                      <span className="ui-checked:text-gray-100">
                                                                          {member.position ===
                                                                          "vice_chairman"
                                                                              ? "Wakil Ketua"
                                                                              : "Ketua"}
                                                                      </span>
                                                                  </div>
                                                              );
                                                          })}
                                                      </div>
                                                  </RadioGroup.Option>
                                              );
                                          })}
                                      </div>
                                  </RadioGroup>
                              </div>
                          );
                      })
                    : undefined}
            </div>
        </div>
    );
}

export default function Home() {
    const { data: members } = useQuery({
        queryKey: ["organization-members"],
        queryFn: getOrganizationMembers,
    });

    const { mutate: mutateVotePairs, data: mutateVotePairsResponse } =
        useMutation({
            mutationFn: async function ({
                studentId,
                organizationPairs,
            }: {
                studentId: number;
                organizationPairs: OrganizationPair[];
            }) {
                if (!studentId || !studentPassword || !organizationPairs) {
                    return;
                }

                return await voteOrganizationPairs({
                    studentId,
                    studentPassword,
                    organizationPairs,
                });
            },
        });

    const [studentId, setStudentId] = useState<number>();
    const [studentPassword, setStudentPassword] = useState<string>();
    const [organizationPairs, setOrganizationPairs] =
        useState<OrganizationPairs>({});
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [voteResponseJson, setVoteResponseJson] = useState<
        | {
              message: string;
          }
        | { error: string }
    >();

    useEffect(
        function () {
            async function getVoteResponseJson() {
                if (!mutateVotePairsResponse) {
                    return;
                }

                if (!mutateVotePairsResponse?.bodyUsed) {
                    setVoteResponseJson(await mutateVotePairsResponse.json());
                }
            }

            getVoteResponseJson();
        },
        [mutateVotePairsResponse]
    );

    const [pageIndex, setPageIndex] = useState<number>(1);
    const pageIndexLimit = 2;

    return (
        <div>
            <div className="flex flex-col px-5 max-w-xl m-auto">
                <div className="p-3" />

                {pageIndex === 1 ? (
                    <StudentDetailsPage
                        studentId={studentId}
                        setStudentId={setStudentId}
                        studentPassword={studentPassword}
                        setStudentPassword={setStudentPassword}
                    />
                ) : null}

                {pageIndex === 2 ? (
                    <VotePage
                        members={members}
                        setOrganizationPairs={setOrganizationPairs}
                    />
                ) : null}

                {pageIndex === pageIndexLimit ? (
                    <>
                        <div className="p-8" />

                        <div className="flex flex-col gap-3 items-center justify-center">
                            <button
                                disabled={hasSubmitted}
                                onClick={function () {
                                    if (!studentId || !organizationPairs) {
                                        return;
                                    }

                                    setHasSubmitted(true);

                                    mutateVotePairs({
                                        studentId: studentId,
                                        organizationPairs:
                                            Object.values(organizationPairs),
                                    });

                                    setTimeout(function () {
                                        setPageIndex(1);

                                        setStudentId(undefined);
                                        setStudentPassword(undefined);

                                        setOrganizationPairs({});
                                        setVoteResponseJson(undefined);

                                        setHasSubmitted(false);
                                    }, 2000);
                                }}
                                className="bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl flex gap-3 justify-center items-center cursor-pointer disabled:bg-gray-200 disabled:text-gray-300"
                            >
                                Submit
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </button>

                            {hasSubmitted &&
                            voteResponseJson &&
                            "error" in voteResponseJson
                                ? JSON.stringify(voteResponseJson.error)
                                : ""}

                            {hasSubmitted &&
                            mutateVotePairsResponse?.status === 200
                                ? "Successfully voted!"
                                : ""}
                        </div>
                    </>
                ) : null}

                <div className="p-6" />
            </div>

            <div className="flex gap-3 justify-center">
                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center disabled:bg-gray-50 disabled:text-gray-300"
                    disabled={pageIndex <= 1}
                    onClick={function () {
                        setPageIndex(function (pageIndex) {
                            if (pageIndex > 1) {
                                return pageIndex - 1;
                            }

                            return pageIndex;
                        });
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                    <span className="hidden sm:block">Previous</span>
                </button>

                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center disabled:bg-gray-50 disabled:text-gray-300"
                    disabled={pageIndex >= pageIndexLimit}
                    onClick={async function () {
                        if (!studentId || !studentPassword) {
                            return;
                        }

                        const passwordValidation = await getPasswordValidation({
                            studentId,
                            password: studentPassword,
                        });

                        setPageIndex(function (pageIndex) {
                            if (pageIndex + 1 === 2 && !passwordValidation) {
                                return pageIndex;
                            }

                            if (pageIndex < pageIndexLimit) {
                                return pageIndex + 1;
                            }

                            return pageIndex;
                        });
                    }}
                >
                    <span className="hidden sm:block">Next</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            </div>
            <div className="p-3" />
        </div>
    );
}
