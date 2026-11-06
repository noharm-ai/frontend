import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";

import { formatDecimal, formatInteger, formatShare } from "../../format";
import { shareOf } from "../../indication";
import { PROPHYLAXIS_TYPES } from "../../options";
import {
  IDepartmentRow,
  IReportParams,
} from "../../infectionControlReportTypes";
import { Block } from "../../Block/Block";
import { DepartmentAdmissions } from "../../DepartmentAdmissions/DepartmentAdmissions";

// which numbers the table shows: the ones of the tab it sits in
type DepartmentsView = "conformity" | "reviews" | "dotLot";

// one anchor per tab, so help pinned to a tab's table stays on it
const KB: Record<DepartmentsView, string> = {
  conformity: "reports.infectionControl.departments",
  reviews: "reports.infectionControl.reviewsDepartments",
  dotLot: "reports.infectionControl.dotLotDepartments",
};

interface DepartmentsProps {
  view: DepartmentsView;
  departments?: IDepartmentRow[];
  // the request of the period on screen, which the drill-down repeats
  params: IReportParams | null;
  loading: boolean;
}

/** The numbers of a tab by department; a row's button opens its admissions. */
export function Departments({
  view,
  departments,
  params,
  loading,
}: DepartmentsProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<IDepartmentRow | null>(null);
  const tk = (key: string) =>
    t(`infectionControlConsolidated.departments.${key}`);
  const right = "right" as const;
  const sorter =
    (key: keyof IDepartmentRow) => (a: IDepartmentRow, b: IDepartmentRow) =>
      Number(a[key] ?? -1) - Number(b[key] ?? -1);
  const column = (
    label: string,
    key: keyof IDepartmentRow,
    format: (value: number) => string,
  ) => ({
    title: tk(label),
    dataIndex: key,
    key,
    align: right,
    sorter: sorter(key),
    render: (value: number) => format(value),
  });

  // the share of the department's DOT given with these treatment types
  const typeShare = (row: IDepartmentRow, keys: string[]) =>
    row.treatmentTypeDays
      ? shareOf(
          keys.reduce(
            (sum, key) => sum + (row.treatmentTypeDays?.[key] || 0),
            0,
          ),
          row.dot,
        )
      : null;
  const typeColumn = (label: string, keys: string[]) => ({
    title: tk(label),
    key: label,
    align: right,
    sorter: (a: IDepartmentRow, b: IDepartmentRow) =>
      (typeShare(a, keys) ?? -1) - (typeShare(b, keys) ?? -1),
    render: (_: unknown, row: IDepartmentRow) =>
      formatShare(typeShare(row, keys)),
  });

  const byView: Record<DepartmentsView, TableColumnsType<IDepartmentRow>> = {
    conformity: [
      column("admissions", "admissions", formatInteger),
      column("withRecord", "dotWithRecordShare", formatShare),
      column("conforming", "conformingShare", formatShare),
      column("d3", "evaluatedByD3Share", formatShare),
      column("acceptance", "interventionAcceptance", formatShare),
    ],
    reviews: [
      column("admissionsClosed", "admissionsClosed", formatInteger),
      column("reviewed", "admissionsReviewedShare", formatShare),
      column("reviewsPerAdmission", "reviewsPerAdmission", formatDecimal),
      column("reviewsPer100Dot", "reviewsPer100Dot", formatDecimal),
      column("firstReview", "timeToFirstReviewHours", formatDecimal),
      column("pendingTime", "pendingTimeShare", formatShare),
    ],
    dotLot: [
      column("patients", "patientsOnAntimicrobials", formatInteger),
      column("patientDays", "patientDays", formatInteger),
      column("dot", "dot", formatInteger),
      column("dotPer1000", "dotPer1000PatientDays", formatDecimal),
      column("lot", "lot", formatInteger),
      column("dotLot", "dotLot", (value) => formatDecimal(value, 2)),
      column("access", "accessShare", formatShare),
      typeColumn("empirical", ["1"]),
      typeColumn("cultureGuided", ["2"]),
      typeColumn("prophylaxis", PROPHYLAXIS_TYPES),
    ],
  };

  const columns: TableColumnsType<IDepartmentRow> = [
    {
      title: tk("department"),
      dataIndex: "department",
      key: "department",
      sorter: (a: IDepartmentRow, b: IDepartmentRow) =>
        (a.department || "").localeCompare(b.department || ""),
    },
    ...byView[view],
    {
      title: t("tableHeader.action"),
      key: "action",
      width: 70,
      align: "center",
      render: (_: unknown, row: IDepartmentRow) => (
        <Tooltip title={tk("drill")}>
          <Button
            icon={<SearchOutlined />}
            aria-label={tk("drill")}
            onClick={() => setSelected(row)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Block
      title={tk("title")}
      help={tk(`${view}Description`)}
      loading={loading}
    >
      <Table<IDepartmentRow>
        data-kb={KB[view]}
        columns={columns}
        dataSource={departments || []}
        rowKey={(row: IDepartmentRow) => `${row.idDepartment}`}
        pagination={false}
        size="small"
        scroll={{ x: true }}
      />
      <DepartmentAdmissions
        department={selected}
        params={params}
        onClose={() => setSelected(null)}
      />
    </Block>
  );
}
