import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Alert, Space, Spin, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { ExportOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import Empty from "components/Empty";
import Tooltip from "components/Tooltip";

import {
  fetchAdmissionCourses,
  fetchDepartmentAdmissions,
} from "../InfectionControlConsolidatedReportSlice";
import { EMPTY, formatDecimal, formatInteger } from "../format";
import {
  IAdmission,
  ICourse,
  IDepartmentRow,
  IReportParams,
} from "../infectionControlReportTypes";
import { AdmissionsBody } from "./DepartmentAdmissions.style";

interface DepartmentAdmissionsProps {
  // the department whose admissions are listed; null keeps the modal closed
  department: IDepartmentRow | null;
  // the request of the period on screen, so the list matches the table
  params: IReportParams | null;
  onClose: () => void;
}

// the modal takes the whole screen but this margin, and only its list scrolls
const MARGIN = 24;

const formatDate = (value: string | null) =>
  value ? dayjs(value).format("DD/MM/YY") : EMPTY;

/**
 * The drill-down of a department row: its admissions in the period and, for
 * the admission clicked, every antimicrobial course it had.
 */
export function DepartmentAdmissions({
  department,
  params,
  onClose,
}: DepartmentAdmissionsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const tk = (key: string, options?: Record<string, unknown>) =>
    t(`infectionControlConsolidated.drill.${key}`, options);
  const admissions = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.admissions,
  );
  const courses = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.courses,
  );
  // one admission open at a time: the courses of the last one clicked
  const [expanded, setExpanded] = useState<number | null>(null);
  // the scrolling list, which the table's sticky header follows
  const listRef = useRef<HTMLDivElement>(null);
  const right = "right" as const;

  useEffect(() => {
    if (!department || !params) return;

    dispatch(
      fetchDepartmentAdmissions({
        ...params,
        admissions_of: department.idDepartment,
      }),
    );
  }, [department, params, dispatch]);

  // the next department opens with no admission expanded
  const close = () => {
    setExpanded(null);
    onClose();
  };

  const onExpand = (open: boolean, admission: IAdmission) => {
    if (!open || !params) {
      setExpanded(null);
      return;
    }

    setExpanded(admission.admissionNumber);
    dispatch(
      fetchAdmissionCourses({
        year: params.year,
        courses_of: admission.admissionNumber,
      }),
    );
  };

  const admissionColumns: TableColumnsType<IAdmission> = [
    {
      title: tk("admission"),
      dataIndex: "admissionNumber",
      key: "admissionNumber",
      render: (value: number) => (
        <Space size={4}>
          {value}
          <Tooltip title={tk("openAdmission")}>
            <Link
              to={`/controle-infeccao/${value}`}
              target="_blank"
              onClick={(event) => event.stopPropagation()}
              aria-label={tk("openAdmission")}
            >
              <ExportOutlined />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: tk("status"),
      key: "status",
      render: (_: unknown, row: IAdmission) =>
        row.followed ? (
          <Tag color="blue">{tk("followed")}</Tag>
        ) : (
          tk("closed", { date: formatDate(row.closedAt) })
        ),
    },
    {
      title: tk("patient"),
      key: "patient",
      render: (_: unknown, row: IAdmission) =>
        [
          row.age == null ? null : tk("age", { count: row.age }),
          row.sex
            ? t(`infectionControlConsolidated.sex.${row.sex}`, {
                defaultValue: row.sex,
              })
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || EMPTY,
    },
    {
      title: tk("diagnosis"),
      key: "diagnosis",
      render: (_: unknown, row: IAdmission) =>
        [row.idcid, row.diagnosis].filter(Boolean).join(" - ") || EMPTY,
    },
    {
      title: tk("antimicrobials"),
      key: "antimicrobials",
      // no end while the antimicrobials go on
      render: (_: unknown, row: IAdmission) =>
        row.antimicrobialEnd
          ? `${formatDate(row.antimicrobialStart)} - ${formatDate(row.antimicrobialEnd)}`
          : formatDate(row.antimicrobialStart),
    },
    ...(
      [
        ["dot", "dot"],
        ["episodes", "episodes"],
        ["reviews", "reviews"],
        ["lengthOfStay", "lengthOfStayDays"],
      ] as const
    ).map(([label, key]) => ({
      title: tk(label),
      dataIndex: key,
      key,
      align: right,
      sorter: (a: IAdmission, b: IAdmission) =>
        Number(a[key] ?? -1) - Number(b[key] ?? -1),
      render: (value: number | null) => formatInteger(value),
    })),
    {
      title: tk("firstReview"),
      dataIndex: "timeToFirstReviewHours",
      key: "timeToFirstReviewHours",
      align: right,
      sorter: (a: IAdmission, b: IAdmission) =>
        Number(a.timeToFirstReviewHours ?? -1) -
        Number(b.timeToFirstReviewHours ?? -1),
      render: (value: number | null) => formatDecimal(value),
    },
  ];

  const yesNo = (value: boolean | null) =>
    value == null ? EMPTY : value ? tk("yes") : tk("no");

  const courseColumns: TableColumnsType<ICourse> = [
    {
      title: tk("substance"),
      dataIndex: "substance",
      key: "substance",
      render: (value: string | null) => value || EMPTY,
    },
    {
      title: tk("aware"),
      dataIndex: "awareLevel",
      key: "awareLevel",
      render: (value: number | null) =>
        value == null
          ? t("culture.awareLevel.unknown")
          : t(`culture.awareLevel.${value}`),
    },
    {
      title: tk("start"),
      dataIndex: "start",
      key: "start",
      render: (value: string | null) => formatDate(value),
    },
    {
      title: tk("days"),
      key: "days",
      align: right,
      render: (_: unknown, row: ICourse) =>
        row.plannedDays == null
          ? formatInteger(row.days)
          : `${formatInteger(row.days)} (${formatInteger(row.plannedDays)})`,
    },
    {
      title: tk("route"),
      dataIndex: "route",
      key: "route",
      render: (value: string | null) => value || EMPTY,
    },
    {
      title: tk("department"),
      dataIndex: "department",
      key: "department",
      render: (value: string | null) => value || EMPTY,
    },
    {
      title: tk("ivToOral"),
      dataIndex: "ivToOralDay",
      key: "ivToOralDay",
      render: (value: number | null) => (value == null ? EMPTY : `D${value}`),
    },
    {
      title: tk("d3"),
      dataIndex: "evaluatedByD3",
      key: "evaluatedByD3",
      render: (value: boolean | null) => yesNo(value),
    },
    {
      title: tk("finalVerdict"),
      dataIndex: "finalVerdict",
      key: "finalVerdict",
      render: (value: ICourse["finalVerdict"]) =>
        value ? (
          <Tag color={value === "conforming" ? "green" : "red"}>
            {t(`infectionControlConsolidated.status.${value}`)}
          </Tag>
        ) : (
          EMPTY
        ),
    },
    {
      title: tk("flags"),
      key: "flags",
      render: (_: unknown, row: ICourse) => (
        <Space size={4} wrap>
          {row.ongoing && <Tag color="blue">{tk("ongoing")}</Tag>}
          {row.restart && <Tag>{tk("restart")}</Tag>}
          {row.pastPlannedEnd && (
            <Tag color="orange">{tk("pastPlannedEnd")}</Tag>
          )}
          {row.everNonConforming && (
            <Tag color="red">{tk("everNonConforming")}</Tag>
          )}
        </Space>
      ),
    },
  ];

  const renderCourses = (admission: IAdmission) => {
    if (courses.status === "failed") {
      return (
        <Alert
          type="error"
          showIcon
          title={t("infectionControlConsolidated.loadError")}
          description={
            courses.error || t("infectionControlConsolidated.unexpectedError")
          }
        />
      );
    }

    return (
      <div data-kb="reports.infectionControl.admissionCourses">
        <strong>
          {tk("courses", { admission: admission.admissionNumber })}
        </strong>
        <Table<ICourse>
          columns={courseColumns}
          dataSource={courses.result.courses || []}
          rowKey={(row: ICourse) => `${row.course}`}
          loading={courses.status === "loading"}
          locale={{ emptyText: <Empty description={tk("noCourses")} /> }}
          pagination={false}
          size="small"
          scroll={{ x: true }}
          style={{ marginTop: 8 }}
        />
      </div>
    );
  };

  return (
    <DefaultModal
      open={!!department}
      title={tk("title", { department: department?.department ?? "" })}
      onCancel={close}
      footer={<Button onClick={close}>{tk("close")}</Button>}
      width={`calc(100vw - ${MARGIN * 2}px)`}
      style={{ top: MARGIN, paddingBottom: 0 }}
      styles={{
        container: {
          height: `calc(100vh - ${MARGIN * 2}px)`,
          display: "flex",
          flexDirection: "column",
        },
        body: { flex: 1, minHeight: 0 },
      }}
      destroyOnHidden
    >
      <AdmissionsBody data-kb="reports.infectionControl.departmentAdmissions">
        <p>{tk("description")}</p>
        {admissions.status === "failed" ? (
          <Alert
            type="error"
            showIcon
            title={t("infectionControlConsolidated.loadError")}
            description={
              admissions.error ||
              t("infectionControlConsolidated.unexpectedError")
            }
          />
        ) : (
          <div className="admissions-list" ref={listRef}>
            <Spin spinning={admissions.status === "loading"}>
              <Table<IAdmission>
                sticky={{ getContainer: () => listRef.current || window }}
                columns={admissionColumns}
                dataSource={admissions.result.admissions || []}
                rowKey={(row: IAdmission) => `${row.admissionNumber}`}
                locale={{
                  emptyText: (
                    <Empty
                      description={t("infectionControlConsolidated.noData")}
                    />
                  ),
                }}
                expandable={{
                  expandRowByClick: true,
                  expandedRowKeys: expanded == null ? [] : [`${expanded}`],
                  onExpand,
                  expandedRowRender: renderCourses,
                }}
                pagination={{ pageSize: 50, hideOnSinglePage: true }}
                size="small"
                scroll={{ x: true }}
              />
            </Spin>
          </div>
        )}
      </AdmissionsBody>
    </DefaultModal>
  );
}
