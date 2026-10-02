import type { ReactNode } from "react";

export type DataRow = Record<string, unknown> & {
  _index?: number;
  key?: string | number;
};

export interface ColumnMeta {
  key: string;
  title: string;
  type: "string" | "number" | "boolean" | "object";
}

export interface ColumnOverride {
  /** Header content; the column key is shown when omitted. */
  title?: ReactNode;
  /** Cell content, also used in the record drawer. */
  render?: (value: unknown, record: DataRow) => ReactNode;
  /** false turns sorting off for the column. */
  sortable?: boolean;
}

export interface ExtraColumn {
  key: string;
  /** Key of the column it follows; appended at the end when omitted. */
  after?: string;
}
