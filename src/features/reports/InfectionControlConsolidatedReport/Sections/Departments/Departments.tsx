import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table } from "antd";
import type { TableColumnsType } from "antd";

import { SectionHeader } from "styles/Report.style";

import { formatDecimal, formatInteger, formatShare } from "../../format";
import {
  IDepartmentRow,
  IReportParams,
} from "../../infectionControlReportTypes";
import { Section } from "../../InfectionControlConsolidatedReport.style";
import { DepartmentAdmissions } from "../../DepartmentAdmissions/DepartmentAdmissions";

interface DepartmentsProps {
  departments?: IDepartmentRow[];
  // the request of the period on screen, which the drill-down repeats
  params: IReportParams | null;
  loading: boolean;
}

/** The headline numbers by department; a row opens its admissions. */
export function Departments({
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

  const columns: TableColumnsType<IDepartmentRow> = [
    {
      title: tk("department"),
      dataIndex: "department",
      key: "department",
      sorter: (a: IDepartmentRow, b: IDepartmentRow) =>
        (a.department || "").localeCompare(b.department || ""),
    },
    {
      title: tk("admissions"),
      dataIndex: "admissions",
      key: "admissions",
      align: right,
      sorter: sorter("admissions"),
      render: (value: number) => formatInteger(value),
    },
    {
      title: tk("dot"),
      dataIndex: "dot",
      key: "dot",
      align: right,
      sorter: sorter("dot"),
      render: (value: number) => formatInteger(value),
    },
    {
      title: tk("dotPer1000"),
      // no `key`: antd keys the column by its dataIndex
      dataIndex: "dotPer1000PatientDays",
      align: right,
      sorter: sorter("dotPer1000PatientDays"),
      render: (value: number) => formatDecimal(value),
    },
    ...[
      ["access", "accessShare"],
      ["conforming", "conformingShare"],
      ["d3", "evaluatedByD3Share"],
    ].map(([label, key]) => ({
      title: tk(label),
      dataIndex: key,
      key,
      align: right,
      sorter: sorter(key as keyof IDepartmentRow),
      render: (value: number) => formatShare(value),
    })),
    {
      title: tk("firstReview"),
      dataIndex: "timeToFirstReviewHours",
      key: "timeToFirstReviewHours",
      align: right,
      sorter: sorter("timeToFirstReviewHours"),
      render: (value: number) => formatDecimal(value),
    },
    ...[
      ["acceptance", "interventionAcceptance"],
      ["pendingTime", "pendingTimeShare"],
    ].map(([label, key]) => ({
      title: tk(label),
      dataIndex: key,
      key,
      align: right,
      sorter: sorter(key as keyof IDepartmentRow),
      render: (value: number) => formatShare(value),
    })),
  ];

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>
          {tk("description")}. {tk("drillHint")}
        </div>
      </SectionHeader>
      <Table<IDepartmentRow>
        data-kb="reports.infectionControl.departments"
        columns={columns}
        dataSource={departments || []}
        rowKey={(row: IDepartmentRow) => `${row.idDepartment}`}
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: true }}
        onRow={(row: IDepartmentRow) => ({
          onClick: () => setSelected(row),
          style: { cursor: "pointer" },
        })}
      />
      <DepartmentAdmissions
        department={selected}
        params={params}
        onClose={() => setSelected(null)}
      />
    </Section>
  );
}
