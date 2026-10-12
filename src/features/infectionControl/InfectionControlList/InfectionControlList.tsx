import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import PatientNameCache from "components/PatientName/PatientNameCache";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate, formatDateTime } from "utils/date";
import { PageCard } from "styles/Utils.style";

import {
  fetchFollowedAdmissions,
  IFollowedAdmission,
  PAGE_SIZE,
  setFilterStatus,
  setPage,
} from "../InfectionControlListSlice";
import { describePending } from "../followUp";
import { Header, StateBox } from "../InfectionControl/InfectionControl.style";
import { WorklistFilter } from "./WorklistFilter/WorklistFilter";
import { ListBox, StatusFilter } from "./InfectionControlList.style";

const STATUSES = [
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
  const { status, list, count, countByStatus, filterStatus, filters, page } =
    useAppSelector((state) => state.infectionControlList);

  const load = () => {
    dispatch(fetchFollowedAdmissions({ status: filterStatus, page, filters }));
  };

  useEffect(() => {
    load();
  }, [filterStatus, page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // the patient page opens in a new tab, so the worklist keeps its order,
  // filters and page
  const patientUrl = (admission: IFollowedAdmission) =>
    `/controle-infeccao/${admission.admissionNumber}`;

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
      key: "admissionNumber",
      render: (_, admission) => (
        <a href={patientUrl(admission)} target="_blank" rel="noreferrer">
          {admission.admissionNumber}
        </a>
      ),
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
        <Tooltip title={t("infectionControl.worklist.openNewTab")}>
          <Button
            href={patientUrl(admission)}
            target="_blank"
            rel="noreferrer"
            icon={<SearchOutlined />}
            aria-label={t("infectionControl.worklist.open")}
          />
        </Tooltip>
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

      <WorklistFilter />

      <ListBox>
        <StatusFilter data-kb="infectionControl.worklist.status">
          {STATUSES.map((value) => (
            <Button
              key={value}
              className={value === filterStatus ? "active" : ""}
              onClick={() => dispatch(setFilterStatus(value))}
            >
              {t(`infectionControl.worklist.filter.${value}`)}
              <Tag color={InfectionControlStatusEnum.getColor(value)}>
                {countByStatus[value] ?? 0}
              </Tag>
            </Button>
          ))}
        </StatusFilter>

        <PageCard>
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
        </PageCard>
      </ListBox>
    </>
  );
}
