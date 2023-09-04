import { atom } from "jotai";

type OrganizationPair = {
    organizationPairCompositeId: string;
    organizationId: number;
    pairId: number;
};

type OrganizationPairs = { [organizationName: string]: OrganizationPair };

export const studentIdAtom = atom<number | undefined>(undefined);
export const organizationPairsAtom = atom<OrganizationPairs>({});
