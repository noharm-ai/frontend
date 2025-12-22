import { uniq, uniqBy, isEmpty } from "utils/lodash";
import dayjs from "dayjs";
import humanizeDuration from "humanize-duration";
import { isNumber, formatNumber, isInt } from "./number";
import { isDate, formatDateTime } from "./date";
import { getCSVWorkerManager } from "./workerUtils";

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

export const getUniqDepartments = (datasource, attrDepartment, attrSegment) => {
  if (!datasource.length) return [];
  const keys = [];
  const departments = [];

  datasource.forEach((i) => {
    const key = `${i[attrDepartment]}-${i[attrSegment]}`;
    if (keys.indexOf(key) === -1) {
      departments.push({
        [attrDepartment]: i[attrDepartment],
        [attrSegment]: i[attrSegment],
      });
      keys.push(key);
    }
  });

  return departments;
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

export const exportCSV = async (
  datasource,
  t,
  namespace = "reportcsv",
  options = {}
) => {
  // Fallback function for when Web Workers are not supported
  const fallbackExportCSV = () => {
    const replacer = (key, value) => (value === null ? "" : value);
    const stringify = (value) => {
      if (Array.isArray(value)) {
        return `"${JSON.stringify(value, replacer).replaceAll('"', "")}"`;
      }

      if (isNumber(value) && !isInt(value)) {
        return JSON.stringify(formatNumber(value, 6));
      }

      if (isDate(value)) {
        return JSON.stringify(formatDateTime(value), replacer);
      }

      return JSON.stringify(value, replacer);
    };

    const header = Object.keys(datasource[0]);
    const headerNames = Object.keys(datasource[0]).map((k) =>
      t(`${namespace}.${k}`)
    );
    const csv = [
      headerNames.join(","),
      ...datasource.map((row) =>
        header.map((fieldName) => stringify(row[fieldName])).join(",")
      ),
    ];

    return csv.join("\r\n");
  };

  try {
    let csvContent;

    // Check if Web Workers are supported and datasource is large enough to benefit
    const workerManager = getCSVWorkerManager();
    const shouldUseWorker =
      workerManager.constructor.isSupported() &&
      datasource.length > (options.workerThreshold || 100);

    if (shouldUseWorker) {
      const translatedHeaders = {};
      if (datasource.length > 0) {
        const header = Object.keys(datasource[0]);
        header.forEach((key) => {
          translatedHeaders[key] = t(`${namespace}.${key}`);
        });
      }

      // Use Web Worker for large datasets
      csvContent = await workerManager.processCSV(
        datasource,
        translatedHeaders,
        {
          chunkSize: options.chunkSize || 1000,
          onProgress: options.onProgress,
        }
      );
    } else {
      // Use synchronous processing for small datasets or when workers not supported
      csvContent = fallbackExportCSV();
    }

    // Create blob and trigger download (must happen on main thread)
    const blob = new Blob([csvContent], {
      type: "text/plain;charset=utf-8",
    });

    const link = document.createElement("a");
    link.setAttribute("href", window.URL.createObjectURL(blob));
    link.setAttribute("download", options.filename || "relatorio.csv");
    document.body.appendChild(link);

    link.click();

    // Clean up the link
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }, 100);

    // Return csv for backward compatibility (as array for legacy code)
    return csvContent.split("\r\n");
  } catch (error) {
    console.error("Error exporting CSV:", error);

    // Fall back to synchronous processing if worker fails
    const csvContent = fallbackExportCSV();

    const blob = new Blob([csvContent], {
      type: "text/plain;charset=utf-8",
    });

    const link = document.createElement("a");
    link.setAttribute("href", window.URL.createObjectURL(blob));
    link.setAttribute("download", options.filename || "relatorio.csv");
    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }, 100);

    return csvContent.split("\r\n");
  }
};

// Backward compatibility: synchronous version for legacy code
export const exportCSVSync = (datasource, t, namespace = "reportcsv") => {
  const replacer = (key, value) => (value === null ? "" : value);
  const stringify = (value) => {
    if (Array.isArray(value)) {
      return `"${JSON.stringify(value, replacer).replaceAll('"', "")}"`;
    }

    if (isNumber(value) && !isInt(value)) {
      return JSON.stringify(formatNumber(value, 6));
    }

    if (isDate(value)) {
      return JSON.stringify(formatDateTime(value), replacer);
    }

    return JSON.stringify(value, replacer);
  };

  const header = Object.keys(datasource[0]);
  const headerNames = Object.keys(datasource[0]).map((k) =>
    t(`${namespace}.${k}`)
  );
  const csv = [
    headerNames.join(","),
    ...datasource.map((row) =>
      header.map((fieldName) => stringify(row[fieldName])).join(",")
    ),
  ];

  const blob = new Blob([csv.join("\r\n")], {
    type: "text/plain;charset=utf-8",
  });

  const link = document.createElement("a");
  link.setAttribute("href", window.URL.createObjectURL(blob));
  link.setAttribute("download", "relatorio.csv");
  document.body.appendChild(link);

  link.click();

  // Clean up the link
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }, 100);

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
    return getUniqList(departments, "department")
      .map((d) => ({
        department: d,
        idSegment: 1,
      }))
      .sort(sortDepartments);
  }

  const filteredDepartments = [...departments].filter((i) => {
    return segmentList.indexOf(i.segment) !== -1;
  });

  return getUniqList(filteredDepartments, "department")
    .map((d) => ({
      department: d,
      idSegment: 1, // not being used
    }))
    .sort(sortDepartments);
};

export const formatDuration = (duration) => {
  if (!duration) return "-";
  let units = ["s"];

  if (duration > 60 && duration < 3600) {
    units = ["m"];
  } else if (duration > 3600) {
    units = ["h"];
  }

  return humanizeDuration(duration * 1000, {
    units,
    maxDecimalPoints: 0,
    language: "shortEn",
    languages: {
      shortEn: {
        y: () => "y",
        mo: () => "mo",
        w: () => "w",
        d: () => "d",
        h: () => "h",
        m: () => "min",
        s: () => "s",
        ms: () => "ms",
      },
    },
  });
};
