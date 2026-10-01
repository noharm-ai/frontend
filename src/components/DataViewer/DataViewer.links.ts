import {
  PrescriptionModal,
  buildAdmissionPrescriptionUrl,
  buildConciliationUrl,
  buildPrescriptionUrl,
} from "utils/prescriptionLinks";

import type { ColumnLinkMeta, DataRow } from "./types";

/**
 * Link columns in custom reports.
 *
 * A custom report is a SQL query; its rows are rendered as plain text. A column
 * whose alias is one of the reserved names below is rendered as a link that
 * opens in a new tab instead. The cell value must be the plain positive integer
 * id (a number or a digits-only string), so sorting, filters, charts and the
 * CSV/XLSX export keep the raw number. Any other value (null, empty, "abc",
 * "199.0") is shown as plain text, and the URL is only ever built from the
 * validated digits, never from raw cell content.
 *
 * | Column alias       | Value               | Opens                                         |
 * | ------------------ | ------------------- | --------------------------------------------- |
 * | `link_prescricao`  | prescription id     | /prescricao/{id}                              |
 * | `link_atendimento` | nratendimento       | most recent prescription of the admission     |
 * | `link_conciliacao` | conciliation id     | /conciliacao/{id}                             |
 * | `link_alertas`     | prescription id     | prescription with the alerts modal open       |
 * | `link_exame`       | fkexame             | prescription with the exams modal, on exam    |
 * | `link_evolucao`    | fkevolucao          | prescription with the notes list on that note |
 *
 * `link_exame` and `link_evolucao` also need the prescription id in the same
 * row, read from `link_prescricao`, `fkprescricao` or `idprescricao`. Without it
 * the cell is plain text. Only numeric exams carry an id, so textual exams
 * cannot be targeted.
 *
 * Cast the ids to text. Ids above 2^53 (e.g. 17-digit conciliation ids)
 * lose precision when the report JSON is parsed as numbers, so a numeric
 * value that is not a safe integer is shown as text instead of a wrong link;
 * as a digits-only string it is kept exactly.
 *
 * Example:
 *
 *   SELECT p.fkprescricao::text AS link_prescricao,
 *          e.fkexame::text AS link_exame,
 *          ...
 *
 * Names match exactly and case-insensitively, so a report has at most one link
 * column of each kind. To add a target, add a rule to COLUMN_LINK_RULES.
 */

const PRESCRIPTION_ID_COLUMNS = ["link_prescricao", "fkprescricao", "idprescricao"];

export const toLinkId = (value: unknown): string | undefined => {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) && Number(trimmed) > 0 ? trimmed : undefined;
  }

  return undefined;
};

const getRowPrescriptionId = (row: DataRow): string | undefined => {
  const entries = Object.entries(row);

  for (const column of PRESCRIPTION_ID_COLUMNS) {
    const entry = entries.find(([key]) => key.toLowerCase() === column);
    const id = entry ? toLinkId(entry[1]) : undefined;
    if (id) return id;
  }

  return undefined;
};

interface ColumnLinkRule {
  pattern: RegExp;
  link: ColumnLinkMeta;
}

const COLUMN_LINK_RULES: ColumnLinkRule[] = [
  {
    pattern: /^link_prescricao$/i,
    link: {
      label: "Prescrição",
      title: "Abrir prescrição",
      getHref: (id) => buildPrescriptionUrl(id),
    },
  },
  {
    pattern: /^link_atendimento$/i,
    link: {
      label: "Prescrição",
      title: "Abrir prescrição mais recente do atendimento",
      getHref: (id) => buildAdmissionPrescriptionUrl(id),
    },
  },
  {
    pattern: /^link_conciliacao$/i,
    link: {
      label: "Conciliação",
      title: "Abrir conciliação",
      getHref: (id) => buildConciliationUrl(id),
    },
  },
  {
    pattern: /^link_alertas$/i,
    link: {
      label: "Alertas",
      title: "Abrir alertas da prescrição",
      getHref: (id) =>
        buildPrescriptionUrl(id, { modal: PrescriptionModal.ALERTS }),
    },
  },
  {
    pattern: /^link_exame$/i,
    link: {
      label: "Exame",
      title: "Abrir exame",
      getHref: (id, row) => {
        const idPrescription = getRowPrescriptionId(row);
        return idPrescription
          ? buildPrescriptionUrl(idPrescription, {
              modal: PrescriptionModal.EXAMS,
              fkexame: id,
            })
          : undefined;
      },
    },
  },
  {
    pattern: /^link_evolucao$/i,
    link: {
      label: "Evolução",
      title: "Abrir evolução",
      getHref: (id, row) => {
        const idPrescription = getRowPrescriptionId(row);
        return idPrescription
          ? buildPrescriptionUrl(idPrescription, {
              modal: PrescriptionModal.CLINICAL_NOTES,
              fkevolucao: id,
            })
          : undefined;
      },
    },
  },
];

export const resolveColumnLink = (key: string): ColumnLinkMeta | undefined =>
  COLUMN_LINK_RULES.find((rule) => rule.pattern.test(key))?.link;

export const getColumnHref = (
  link: ColumnLinkMeta | undefined,
  value: unknown,
  row: DataRow,
): string | undefined => {
  if (!link) return undefined;

  const id = toLinkId(value);
  return id ? link.getHref(id, row) : undefined;
};
