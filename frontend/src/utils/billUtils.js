// constants to use for dealing with the statusType of the bills
export const BILL_STATUS = {
    inSenateComm: 'IN_SENATE_COMM',
    senateFloor: 'SENATE_FLOOR',
    passedSenate: 'PASSED_SENATE',

    inAssemblyComm: 'IN_ASSEMBLY_COMM',
    assemblyFloor: 'ASSEMBLY_FLOOR',
    passedAssembly: 'PASSED_ASSEMBLY',

    delivered: 'DELIVERED_TO_GOV',
    signed: 'SIGNED_BY_GOV',
    vetoed: 'VETOED',
};

// Whether a bill has completed a given step or not
// billData = the data for this bill, as received from the API
// step = the step to check (ex: 'PASSED_ASSEMBLY')
export function hasBillCompletedStep(billData, step) {
    return (billData?.milestones?.items || []).some(e => e.statusType === step)
};
