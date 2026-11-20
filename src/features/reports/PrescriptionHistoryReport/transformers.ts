// an event of the prescription as GET /reports/prescription/history lists it
export interface PrescriptionHistoryEvent {
  id: number | string;
  // "PrescriptionAudit" (checks, reviews, PEP integration) or "custom"
  // (creation, arrival, prescalc)
  source: string;
  type: number;
  createdAt: string;
  // empty when NoHarm did it
  responsible?: string | null;
  extra?: unknown;
}

export interface PrescriptionHistoryFilters {
  responsibleList: string[];
}

export interface PrescriptionHistoryReportData {
  list: PrescriptionHistoryEvent[];
}

const filterDatasource = (
  datasource: PrescriptionHistoryEvent[],
  filters: PrescriptionHistoryFilters,
): PrescriptionHistoryEvent[] => {
  return datasource.filter((i) => {
    if (filters.responsibleList.length) {
      return filters.responsibleList.indexOf(i.responsible as string) !== -1;
    }

    return true;
  });
};

export const getReportData = (
  datasource: PrescriptionHistoryEvent[],
  filters: PrescriptionHistoryFilters,
): PrescriptionHistoryReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};
