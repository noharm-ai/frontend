export type DataRow = Record<string, unknown> & {
  _index?: number;
  key?: string | number;
};

export interface ColumnLinkMeta {
  /** Button text, e.g. "Prescrição" */
  label: string;
  /** Tooltip / accessible label prefix, followed by the id, e.g. "Abrir prescrição" */
  title: string;
  /**
   * Builds the URL for an already validated id (digits only). May read sibling
   * columns of the same row; returns undefined when the link cannot be built.
   */
  getHref: (id: string, row: DataRow) => string | undefined;
}

export interface ColumnMeta {
  key: string;
  title: string;
  type: "string" | "number" | "boolean" | "object";
  link?: ColumnLinkMeta;
}
