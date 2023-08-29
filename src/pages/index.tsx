import { useState } from "react";
import { URLSearchParams } from "url";

async function voteOrganizationMembers({
    studentId,
    organizationMemberIds,
}: {
    studentId: number;
    organizationMemberIds: number[];
}) {
    const searchParams = new URLSearchParams({
        studentId: studentId.toString(),
        organizationMemberIds: organizationMemberIds.map(function (
            organizationMemberId
        ) {
            return organizationMemberId.toString();
        }),
    });

    const response = await fetch("/api/vote?" + searchParams, {
        method: "POST",
        cache: "no-cache",
        next: {
            revalidate: 3000,
        },
    });

    return await response.json();
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
            <h1>Student number</h1>

            <input
                type="number"
                value={studentNumber}
                onChange={function (event) {
                    setStudentNumber(event.target.valueAsNumber);
                }}
            />
        </>
    );
}
