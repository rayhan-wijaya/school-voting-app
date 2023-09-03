import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { OrganizationMembers } from "~/pages/api/members";
import { InferGetStaticPropsType } from "next";
import { env } from "~/lib/env";
import { RadioGroup } from "@headlessui/react";

async function voteOrganizationPairs({
    studentId,
    organizationPairIds,
}: {
    studentId: number;
    organizationPairIds: (string | number)[];
}) {
    const response = await fetch("/api/vote?", {
        body: JSON.stringify({
            studentId,
            organizationPairIds,
        }),
        method: "POST",
        cache: "no-cache",
        next: {
            revalidate: 3000,
        },
    });

    return await response.json();
}

async function getOrganizationMembers() {
    const response = await fetch(
        new URL("/api/members", env.NEXT_PUBLIC_BASE_URL)
    );
    return await (response.json() as OrganizationMembers);
}

function StudentNumberPage({
    studentNumber,
    setStudentNumber,
}: {
    studentNumber: number | undefined;
    setStudentNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
}) {
    return (
        <>
            <h1 className="text-center font-semibold">Welcome!</h1>

            <div className="p-1" />

            <p className="text-center">
                Before we get started, please put in your student details
            </p>

            <div className="p-3" />

            <input
                type="number"
                className="bg-gray-100 rounded-xl p-3"
                placeholder="Student ID *"
                value={studentNumber}
                onChange={function (event) {
                    setStudentNumber(event.target.valueAsNumber);
                }}
            />
        </>
    );
}

type OrganizationPairIds = { [organizationName: string]: string | number };

function VotePage({
    members,
    setOrganizationPairIds,
}: {
    members: Awaited<OrganizationMembers>;
    setOrganizationPairIds: React.Dispatch<
        React.SetStateAction<OrganizationPairIds>
    >;
}) {
    const organizationNames = Object.keys(members);

    return (
        <div className="flex flex-col gap-16">
            <div>
                <h1 className="text-center font-semibold">
                    Pick your Vote for Each Organization
                </h1>

                <div className="p-2" />

                <p className="text-center">Please cast your votes</p>
            </div>

            {organizationNames.map(function (organizationName) {
                const organizationPairs = members[organizationName];
                const pairIds = Object.keys(organizationPairs);

                return (
                    <div>
                        <h2 className="font-semibold text-center">
                            {organizationName}
                        </h2>

                        <div className="p-3" />

                        <RadioGroup
                            onChange={function (pairId) {
                                setOrganizationPairIds(function (prevPairIds) {
                                    return {
                                        ...prevPairIds,
                                        [organizationName]: pairId,
                                    };
                                });
                            }}
                        >
                            <div className="grid grid-cols-2 gap-5">
                                {pairIds.map(function (pairId) {
                                    const pair = organizationPairs[pairId];

                                    return (
                                        <RadioGroup.Option
                                            className="focus:outline-none ui-checked:bg-gray-500 bg-gray-100 rounded-xl ui-checked:text-white cursor-pointer ui-active:ring-4 ui-active:ring-gray-400 shadow-md"
                                            value={pairId}
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
                                                {pair.map(function (member) {
                                                    return (
                                                        <div className="p-5">
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
            })}
        </div>
    );
}

export default function Home(
    props: InferGetStaticPropsType<typeof getStaticProps>
) {
    const { data: members } = useQuery({
        queryKey: ["organization-members"],
        queryFn: getOrganizationMembers,
        initialData: props.members,
    });

    const { mutate: mutateVotePairs } = useMutation({
        mutationFn: async function ({
            studentId,
            organizationPairIds,
        }: {
            studentId: number;
            organizationPairIds: (string | number)[];
        }) {
            if (!studentId || !organizationPairIds) {
                return;
            }

            return await voteOrganizationPairs({
                studentId,
                organizationPairIds: organizationPairIds,
            });
        },
    });

    const [studentId, setStudentId] = useState<number>();
    const [organizationPairIds, setOrganizationPairIds] =
        useState<OrganizationPairIds>({});

    const [pageIndex, setPageIndex] = useState<number>(1);
    const pageIndexLimit = 2;

    return (
        <div>
            <div className="flex justify-between gap-3 p-3">
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
                </button>

                <div className="flex flex-col">
                    <div className="p-3" />

                    {pageIndex === 1 ? (
                        <StudentNumberPage
                            studentNumber={studentNumber}
                            setStudentNumber={setStudentNumber}
                        />
                    ) : null}

                    {pageIndex === 2 ? (
                        <VotePage
                            members={members}
                            setOrganizationPairIds={setOrganizationPairIds}
                        />
                    ) : null}

                    {pageIndex === pageIndexLimit ? (
                        <>
                            <div className="p-8" />

                            <div className="flex gap-3 items-center justify-center">
                                <button
                                    onClick={function () {
                                        if (
                                            !studentId ||
                                            !organizationPairIds
                                        ) {
                                            return;
                                        }

                                        console.log("Clicked");

                                        mutateVotePairs({
                                            studentId: studentId,
                                            organizationPairIds:
                                                Object.values(
                                                    organizationPairIds
                                                ),
                                        });
                                    }}
                                    className="bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl flex gap-3 justify-center items-center cursor-pointer"
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
                            </div>
                        </>
                    ) : null}

                    <div className="p-3" />
                </div>

                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center disabled:bg-gray-50 disabled:text-gray-300"
                    disabled={pageIndex >= pageIndexLimit}
                    onClick={function () {
                        setPageIndex(function (pageIndex) {
                            if ((pageIndex + 1) === 2 && !studentId) {
                                return pageIndex;
                            }

                            if (pageIndex < pageIndexLimit) {
                                return pageIndex + 1;
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
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export async function getStaticProps() {
    const members = await getOrganizationMembers();

    return {
        revalidate: 3000,
        props: {
            members,
        },
    };
}
