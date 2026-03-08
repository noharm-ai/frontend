export type DataRow = Record<string, unknown> & {
  _index?: number;
  key?: string | number;
};

export interface ColumnMeta {
  key: string;
  title: string;
  type: "string" | "number" | "boolean" | "object";
}
