import { uniq, isEmpty } from "utils/lodash";
import dayjs from "dayjs";

export const getUniqList = (datasource, attr) => {
  return uniq(datasource.map((i) => i[attr])).sort();
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
