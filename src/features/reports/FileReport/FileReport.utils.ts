import dayjs from "dayjs";

export type FilterType = "string" | "number" | "date" | "boolean" | "object";

export interface ColumnSchema {
  key: string;
  label: string;
  type: FilterType;
  options?: string[]; // For string type, unique values for select
}

export interface Filter {
  id: string;
  field: string;
  value: any;
  mode?: "list" | "text";
}

const isDate = (value: any): boolean => {
  if (typeof value !== "string") return false;
  // strict check for date format to avoid false positives with simple numbers or strings
  return dayjs(
    value,
    ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY"],
    true,
  ).isValid();
};

export const detectColumnSchema = (data: any[]): ColumnSchema[] => {
  if (!data || data.length === 0) return [];

  const sampleSize = 100;
  const sample = data.slice(0, sampleSize);
  const keys = Object.keys(sample[0] || {});

  return keys.map((key) => {
    const values = data
      .map((item) => item[key])
      .filter((v) => v !== null && v !== undefined && v !== "");
    const nonNullSample = values.slice(0, sampleSize);

    let type: FilterType = "string";

    if (nonNullSample.length > 0) {
      if (
        nonNullSample.every(
          (v) => typeof v === "number" || (!isNaN(Number(v)) && v !== ""),
        )
      ) {
        type = "number";
      } else if (
        nonNullSample.every(
          (v) => typeof v === "boolean" || v === "true" || v === "false",
        )
      ) {
        type = "boolean";
      } else if (nonNullSample.every(isDate)) {
        type = "date";
      } else if (nonNullSample.every((v) => typeof v === "object")) {
        type = "object";
      }
    }

    const schema: ColumnSchema = {
      key,
      label: key,
      type,
    };

    if (type === "string") {
      // Collect unique values for select options
      const uniqueValues = Array.from(new Set(values.map(String))).sort();
      // Limit options to prevent performance issues with high cardinality
      if (uniqueValues.length <= 1000) {
        schema.options = uniqueValues;
      }
    }

    return schema;
  });
};

export const applyFilters = (
  data: any[],
  filters: Filter[],
  schema: ColumnSchema[],
): any[] => {
  if (!filters || filters.length === 0) return data;

  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.field];
      const column = schema.find((c) => c.key === filter.field);

      if (!column) return true;

      // Skip filter if value is null/undefined (unless we want to support filtering for nulls, but keeping simple for now)
      if (value === null || value === undefined) return false;

      if (column.type === "string") {
        if (filter.mode === "text") {
          return String(value)
            .toLowerCase()
            .includes(String(filter.value || "").toLowerCase());
        }
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          return filter.value.includes(String(value));
        }
        return true;
      }

      if (
        column.type === "number" &&
        Array.isArray(filter.value) &&
        filter.value.length === 2
      ) {
        const numValue = Number(value);
        const [min, max] = filter.value;
        if (min !== null && numValue < min) return false;
        if (max !== null && numValue > max) return false;
        return true;
      }

      if (
        column.type === "date" &&
        Array.isArray(filter.value) &&
        filter.value.length === 2
      ) {
        const dateValue = dayjs(value);
        const [start, end] = filter.value;

        if (start && dateValue.isBefore(dayjs(start), "day")) return false;
        if (end && dateValue.isAfter(dayjs(end), "day")) return false;
        return true;
      }

      return true;
    });
  });
};
