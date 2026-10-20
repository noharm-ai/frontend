import { useDeferredValue, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Empty, Input, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import PatientNameCache from "components/PatientName/PatientNameCache";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate, formatDateTime } from "utils/date";
import { peekPatient, subscribe } from "utils/patientCache";
import { PageCard } from "styles/Utils.style";

import {
  fetchFollowedAdmissions,
  filtersToSearch,
  IFollowedAdmission,
  LIST_LIMIT,
  listsClosed,
  PAGE_SIZE,
} from "../InfectionControlListSlice";
import { describePending } from "../followUp";
import { Header, StateBox } from "../InfectionControl/InfectionControl.style";
import { WorklistFilter } from "./WorklistFilter/WorklistFilter";
import { ListBox, ListInfo } from "./InfectionControlList.style";

/** Lower case without accents, to compare names as typed */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Renders again as patient names arrive while `active`: the names come from
 * the hospital name service, after the list
 */
function usePatientNameUpdates(active: boolean) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!active) return;
    return subscribe(() => setVersion((version) => version + 1));
  }, [active]);
}

/**
 * /controle-infeccao: the patients the infection control follows, the ones
 * pending longest first, with why they are pending and when they are due
 */
export function InfectionControlList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, list, count, countLimited, errorCode, filters } =
    useAppSelector((state) => state.infectionControlList);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const search = normalize(useDeferredValue(searchText));

  const load = () => {
    dispatch(fetchFollowedAdmissions(filters));
  };

  useEffect(() => {
    load();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // back to the first page when the list or the search changes
  const [pagedFor, setPagedFor] = useState({ list, search });
  if (pagedFor.list !== list || pagedFor.search !== search) {
    setPagedFor({ list, search });
    setPage(1);
  }

  // the patient name is only known here (the backend does not have it), so
  // the search runs on the loaded list
  usePatientNameUpdates(!!search);
  const shownList = search
    ? list.filter(
        (admission) =>
          `${admission.admissionNumber}`.includes(search) ||
          (!!admission.idPatient &&
            normalize(peekPatient(admission.idPatient)?.name ?? "").includes(
              search,
            )),
      )
    : list;
  // the backend counts every match, the list holds up to LIST_LIMIT of them
  const isLimited = status === "succeeded" && count > list.length;

  // the patient page opens in a new tab, so the worklist keeps its order,
  // filters and page; the filters go along for its next pending patient
  const filtersSearch = filtersToSearch(filters);
  const patientUrl = (admission: IFollowedAdmission) =>
    `/controle-infeccao/${admission.admissionNumber}${filtersSearch ? `?${filtersSearch}` : ""}`;

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
        <ListInfo data-kb="infectionControl.worklist.search">
          <Input
            placeholder={t("infectionControl.worklist.searchPlaceholder")}
            style={{ width: 300 }}
            allowClear
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={search ? "active" : ""}
          />
          <span className="list-count">
            {t("infectionControl.worklist.patients")}
            <Tag>
              {search ? `${shownList.length} / ${list.length}` : list.length}
            </Tag>
          </span>
        </ListInfo>

        {/* the closed ones grow without end: only the latest are listed,
            unless searched by admission number */}
        {listsClosed(filters.status) && !filters.admissionNumbers.length && (
          <Alert
            className="list-alert"
            type="info"
            showIcon
            data-kb="infectionControl.worklist.closedWindow"
            message={t("infectionControl.worklist.closedWindow", {
              count: filters.closedDays,
            })}
          />
        )}

        {isLimited && (
          <Alert
            className="list-alert"
            type="warning"
            showIcon
            message={t("infectionControl.worklist.limited", {
              limit: LIST_LIMIT,
            })}
            description={t(
              countLimited
                ? "infectionControl.worklist.limitedHintOver"
                : "infectionControl.worklist.limitedHint",
              { count },
            )}
          />
        )}

        <PageCard>
          {status === "failed" ? (
            <StateBox>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t(
                  errorCode === "errors.queryTimeout"
                    ? "infectionControl.worklist.queryTimeout"
                    : "infectionControl.worklist.loadError",
                )}
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
              dataSource={shownList}
              loading={status === "loading" || status === "idle"}
              locale={{ emptyText: t("infectionControl.worklist.empty") }}
              // paged in the browser, above and below the list as in the
              // prescription prioritization
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                position: ["topRight", "bottomRight"],
                showSizeChanger: false,
                hideOnSinglePage: true,
                onChange: setPage,
              }}
            />
          )}
        </PageCard>
      </ListBox>
    </>
  );
}
