import dayjs, { Dayjs } from "dayjs";

export interface IExamRawItem {
  idExam: number;
  idPatient: number;
  dateExam: string;
  value: string | number | null;
  typeExam: string;
  segExamName?: string | null;
  segExamActive?: boolean;
}

export interface IExamRawFilters {
  dateRange: [Dayjs, Dayjs] | [];
  typesList: string[];
  valueString: string;
}

export interface IExamRawReportData {
  list: IExamRawItem[];
}

export const getReportData = (
  datasource: IExamRawItem[],
  filters: IExamRawFilters
): IExamRawReportData => {
  let list = [...datasource];

  if (filters.dateRange && filters.dateRange.length === 2) {
    const start = dayjs(filters.dateRange[0]).startOf("day");
    const end = dayjs(filters.dateRange[1]).endOf("day");
    list = list.filter((item) => {
      const date = dayjs(item.dateExam);
      return date.isAfter(start) && date.isBefore(end);
    });
  }

  if (filters.typesList && filters.typesList.length > 0) {
    list = list.filter((item) => filters.typesList.includes(item.typeExam));
  }

  if (filters.valueString && filters.valueString.trim() !== "") {
    const search = filters.valueString.trim().toLowerCase();
    list = list.filter(
      (item) => item.value && `${item.value}`.toLowerCase().includes(search)
    );
  }

  return { list };
};
