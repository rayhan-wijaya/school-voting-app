export type OrganizationPair = {
    organizationPairCompositeId: string;
    organizationId: number;
    pairId: number;
};

export type OrganizationPairs = {
    [organizationName: string]: OrganizationPair;
};
