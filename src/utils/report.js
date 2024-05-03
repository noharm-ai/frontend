import { uniq, uniqBy, isEmpty } from "utils/lodash";
import dayjs from "dayjs";

export const getUniqList = (datasource, attr) => {
  if (!datasource.length) return [];

  if (Array.isArray(datasource[0][attr])) {
    const flat = datasource.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue[attr]),
      []
    );

    return uniq(flat).sort();
  }

  return uniq(datasource.map((i) => i[attr]))
    .filter((i) => i !== null)
    .sort();
};

export const getUniqBy = (datasource, attr) => {
  if (!datasource.length) return [];

  return uniqBy(datasource, attr);
};

export const filtersToDescription = (filters, filtersConfig) => {
  const dateFormat = "DD/MM/YY";
  return Object.keys(filters)
    .map((k) => {
      const config = filtersConfig[k] || {
        label: k,
        type: "undefined",
      };

      if (isEmpty(filters[k]) && filters[k] !== true) {
        return null;
      }

      if (config?.type === "range") {
        return `<strong>${config.label}:</strong> ${dayjs(filters[k][0]).format(
          dateFormat
        )} até ${dayjs(filters[k][1]).format(dateFormat)}`;
      }

      if (config?.type === "bool") {
        return `<strong>${config.label}:</strong> ${
          filters[k] ? "Sim" : "Não"
        }`;
      }

      return `<strong>${config.label}:</strong> ${filters[k]}`;
    })
    .filter((i) => i !== null)
    .concat(`<strong>Gerado em:</strong> ${dayjs().format("DD/MM/YY HH:mm")}`)
    .join(" | ");
};

export const exportCSV = (datasource, t) => {
  const replacer = (key, value) => (value === null ? "" : value);
  const header = Object.keys(datasource[0]);
  const headerNames = Object.keys(datasource[0]).map((k) =>
    t(`reportcsv.${k}`)
  );
  const csv = [
    headerNames.join(","),
    ...datasource.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");

  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "relatorio.csv");
  document.body.appendChild(link);

  link.click();

  return csv;
};

export const onBeforePrint = () => {
  const event = new CustomEvent("onbeforeprint");
  window.dispatchEvent(event);

  return new Promise((resolve) => setTimeout(resolve, 100));
};

export const onAfterPrint = () => {
  const event = new CustomEvent("onafterprint");
  window.dispatchEvent(event);
};

export const getDateRangePresets = (reportDate) => [
  {
    label: "Últimos 15 Dias",
    value: [
      dayjs(reportDate).add(-14, "d"),
      dayjs(reportDate).subtract(1, "day"),
    ],
  },
  {
    label: "Mês atual",
    value: [
      dayjs(reportDate).startOf("month"),
      dayjs(reportDate).subtract(1, "day"),
    ],
  },
  {
    label: "Mês anterior",
    value: [
      dayjs(reportDate).subtract(1, "month").startOf("month"),
      dayjs(reportDate).subtract(1, "month").endOf("month"),
    ],
  },
];

export const dateRangeValid = (reportDate, subtractDays = 60) => {
  return (current) => {
    const maxDate = dayjs(reportDate).subtract(1, "day");
    const minDate = dayjs(reportDate).subtract(subtractDays, "day");

    return current > maxDate || current < minDate;
  };
};

export const decompressDatasource = async (datasource) => {
  const stream = new Blob([datasource], {
    type: "application/json",
  }).stream();

  const compressedReadableStream = stream.pipeThrough(
    new window.DecompressionStream("gzip")
  );

  const decompressedResponse = new Response(compressedReadableStream);

  const response = await decompressedResponse.json();

  return response.body;
};

export const convertRange = (value, r1, r2) => {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
};

export const getFilterDepartment = (departments, segmentList) => {
  const sortDepartments = (a, b) =>
    `${a?.department}`.localeCompare(`${b?.department}`);

  if (!departments) return [];

  if (!segmentList || !segmentList.length) {
    return [...departments].sort(sortDepartments);
  }

  return [...departments]
    .filter((i) => {
      return segmentList.indexOf(i.segment) !== -1;
    })
    .sort(sortDepartments);
};
