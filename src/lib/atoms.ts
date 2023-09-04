import { atom } from "jotai";
import { type OrganizationPairs } from "~/types/organization";

export const studentIdAtom = atom<number | undefined>(undefined);
export const organizationPairsAtom = atom<OrganizationPairs>({});
