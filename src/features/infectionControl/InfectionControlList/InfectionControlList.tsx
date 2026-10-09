import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Segmented, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import PatientNameCache from "components/PatientName/PatientNameCache";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate, formatDateTime } from "utils/date";

import {
  fetchFollowedAdmissions,
  IFollowedAdmission,
  PAGE_SIZE,
  setFilterStatus,
  setPage,
} from "../InfectionControlListSlice";
import { describePending } from "../followUp";
import { Header, StateBox } from "../InfectionControl/InfectionControl.style";
import { ListBox } from "./InfectionControlList.style";

const FILTERS = [
  InfectionControlStatusEnum.PENDING,
  InfectionControlStatusEnum.REVISED,
  InfectionControlStatusEnum.CLOSED,
];

/**
 * /controle-infeccao: the patients the infection control follows, the ones
 * pending longest first, with why they are pending and when they are due
 */
export function InfectionControlList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, list, count, filterStatus, page } = useAppSelector(
    (state) => state.infectionControlList,
  );

  const load = () => {
    dispatch(fetchFollowedAdmissions({ status: filterStatus, page }));
  };

  useEffect(() => {
    load();
  }, [filterStatus, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const now = dayjs();
  const isPast = (date: string | null) => !!date && dayjs(date).isBefore(now);

  const columns: ColumnsType<IFollowedAdmission> = [
    {
      title: t("infectionControl.worklist.patient"),
      key: "patient",
      render: (_, admission) =>
        admission.idPatient ? (
          <PatientNameCache idPatient={admission.idPatient} />
        ) : (
          "-"
        ),
    },
    {
      title: t("infectionControl.worklist.admission"),
      dataIndex: "admissionNumber",
      key: "admissionNumber",
    },
    {
      title: t("infectionControl.worklist.department"),
      key: "department",
      render: (_, admission) => (
        <>
          <div>{admission.department ?? "-"}</div>
          {admission.bed && (
            <div className="muted">
              {t("infectionControl.worklist.bed")} {admission.bed}
            </div>
          )}
        </>
      ),
    },
    {
      title: t("infectionControl.worklist.status"),
      key: "status",
      render: (_, admission) => (
        <>
          <Tag color={InfectionControlStatusEnum.getColor(admission.status)}>
            {t(`infectionControl.followUp.status.${admission.status}`)}
          </Tag>
          <div className="muted">
            {t("infectionControl.followUp.since", {
              date: formatDateTime(admission.statusDate),
            })}
          </div>
        </>
      ),
    },
    {
      title: t("infectionControl.worklist.pendings"),
      key: "pendings",
      render: (_, admission) =>
        admission.pendings.length === 0 ? (
          "-"
        ) : (
          <ul className="pendings">
            {admission.pendings.map((pending) => (
              <li key={pending.id}>{describePending(pending, {}, t)}</li>
            ))}
          </ul>
        ),
    },
    {
      title: t("infectionControl.worklist.nextReview"),
      key: "nextReview",
      render: (_, admission) =>
        admission.nextReviewDate ? (
          <span className={isPast(admission.nextReviewDate) ? "overdue" : ""}>
            {formatDate(admission.nextReviewDate)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: t("infectionControl.worklist.validity"),
      key: "validity",
      render: (_, admission) =>
        admission.earliestValidUntil ? (
          <span
            className={isPast(admission.earliestValidUntil) ? "overdue" : ""}
          >
            {formatDate(admission.earliestValidUntil)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, admission) => (
        <Button href={`/controle-infeccao/${admission.admissionNumber}`}>
          {t("infectionControl.worklist.open")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Header>
        <div>
          <h1
            className="page-header-title"
            data-kb="infectionControl.worklist.title"
          >
            {t("infectionControl.worklist.title")}
          </h1>
          <div className="page-header-legend">
            {t("infectionControl.worklist.legend")}
          </div>
        </div>
      </Header>

      <ListBox>
        <div className="list-filters">
          <Segmented
            value={filterStatus}
            onChange={(value) => dispatch(setFilterStatus(value as number))}
            options={FILTERS.map((value) => ({
              value,
              label: t(`infectionControl.worklist.filter.${value}`),
            }))}
          />
        </div>

        {status === "failed" ? (
          <StateBox>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("infectionControl.worklist.loadError")}
            />
            <Button icon={<ReloadOutlined />} onClick={load}>
              {t("infectionControl.retry")}
            </Button>
          </StateBox>
        ) : (
          <Table
            data-kb="infectionControl.worklist.list"
            rowKey="admissionNumber"
            columns={columns}
            dataSource={list}
            loading={status === "loading" || status === "idle"}
            locale={{ emptyText: t("infectionControl.worklist.empty") }}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: count,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: (value) => dispatch(setPage(value)),
            }}
          />
        )}
      </ListBox>
    </>
  );
}
