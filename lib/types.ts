export type PublicReport = {
  reference: string;
  incidentDate: string;
  approximateTime: string;
  timePeriod: string;
  broadArea: string;
  streetName: string | null;
  noiseType: string[];
  duration: string;
  experiencedAt: string;
  windowState: string | null;
  effects: string[];
  disruptionLevel: string;
  frequency: string;
  reportTiming: string;
};

export type AdminReport = PublicReport & {
  id: string;
  status: string;
  reporterName: string | null;
  reporterEmail: string | null;
  privateComments: string | null;
  adminNote: string | null;
  possibleDuplicates: string[];
  submittedAt: string;
  history?: Array<{
    action: string;
    fromStatus: string | null;
    toStatus: string | null;
    reason: string | null;
    createdAt: string;
  }>;
};
