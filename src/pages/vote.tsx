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
