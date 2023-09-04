import { RadioGroup } from "@headlessui/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { useRouter } from "next/router";
import { organizationPairsAtom } from "~/lib/atoms";
import { env } from "~/lib/env";
import { type OrganizationMembers } from "~/pages/api/members";
import { type OrganizationPair } from "~/types/organization";

async function getOrganizationMembers() {
    const response = await fetch(
        new URL("/api/members", env.NEXT_PUBLIC_BASE_URL)
    );
    return await (response.json() as OrganizationMembers);
}

function VotePage() {
    const { data: members } = useQuery({
        queryKey: ["organization-members"],
        queryFn: getOrganizationMembers,
    });

    const organizationNames = members ? Object.keys(members) : [];
    const [organizationIndex, setOrganizationIndex] = useState<number>(0);
    const [selectedOrganizationPairs, setSelectedOrganizationPairs] = useAtom(
        organizationPairsAtom
    );

    const router = useRouter();

    return (
        <>
            <div className="p-3" />

            <h1 className="text-center font-semibold">
                Pick your Vote for Each Organization
            </h1>

            <div className="p-2" />

            <p className="text-center">Please cast your votes</p>

            <div className="p-6" />

            <div className="flex flex-col gap-16 max-w-lg px-5 m-auto">
                {members ? (
                    <div key={organizationNames[organizationIndex]}>
                        <h2 className="font-semibold text-center">
                            {organizationNames[organizationIndex]}
                        </h2>

                        <div className="p-3" />

                        <RadioGroup
                            by={"organizationPairCompositeId"}
                            onChange={function (pair: OrganizationPair) {
                                setSelectedOrganizationPairs(function (
                                    prevPairs
                                ) {
                                    return {
                                        ...prevPairs,
                                        [organizationNames[organizationIndex]]:
                                            pair,
                                    };
                                });
                            }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {Object.keys(
                                    members[
                                        organizationNames[organizationIndex]
                                    ]
                                ).map(function (pairId) {
                                    const pair =
                                        members[
                                            organizationNames[organizationIndex]
                                        ][pairId];

                                    return (
                                        <RadioGroup.Option
                                            className="focus:outline-none ui-checked:bg-gray-500 bg-gray-100 rounded-xl ui-checked:text-white cursor-pointer ui-active:ring-4 ui-active:ring-gray-400 shadow-md"
                                            key={`${pair[0].organizationId}-${pairId}`}
                                            value={
                                                {
                                                    organizationPairCompositeId: `${pair[0].organizationId}-${pairId}`,
                                                    pairId: Number(pairId),
                                                    organizationId: Number(
                                                        pair[0].organizationId
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
                                                {pair.map(function (member) {
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
                ) : undefined}
            </div>

            <div className="p-6" />

            <div className="flex gap-3 justify-center">
                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center disabled:bg-gray-50 disabled:text-gray-300"
                    onClick={function () {
                        if (organizationIndex <= 0) {
                            return router.replace("/");
                        }

                        setOrganizationIndex(function (organizationIndex) {
                            return organizationIndex - 1;
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
                    disabled={organizationIndex === (organizationNames.length - 1)}
                    onClick={function () {
                        setOrganizationIndex(function (organizationIndex) {
                            return organizationIndex + 1;
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
        </>
    );
}

export default VotePage;
