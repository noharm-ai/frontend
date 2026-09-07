import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Progress, TableProps } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import Empty from "components/Empty";
import { Input, Select } from "components/Inputs";
import notification from "components/notification";
import { formatDateTime } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";

import {
  fetchTrainingOverview,
  reset,
  ITrainingOverviewUser,
  ITrainingOverviewUserModule,
} from "../TrainingOverviewSlice";
import {
  SummaryRow,
  SummaryCard,
  ModuleProgressPanel,
  ModuleProgressRow,
  UserCell,
  UserModuleList,
  MandatoryCount,
} from "./TrainingOverview.style";
import { PageCard } from "styles/Utils.style";
import { ExtraFilters } from "styles/PageHeader.style";

type UserProgressStatus = "notStarted" | "inProgress" | "completed";
type UserStatusFilter = "active" | "inactive" | "all";

/** Progress over every module the schema offers, not only the mandatory ones */
const getProgressStatus = (user: ITrainingOverviewUser): UserProgressStatus => {
  if (user.totalLessonsFinished === 0) return "notStarted";

  return user.totalLessonsFinished === user.totalLessons
    ? "completed"
    : "inProgress";
};

/** Whether the user still owes mandatory training — the same reading that
 * blocks them from opening support tickets */
const hasPendingMandatory = (user: ITrainingOverviewUser) =>
  user.mandatoryTotal > 0 && user.mandatoryFinished < user.mandatoryTotal;

const percent = (done: number, total: number) =>
  total > 0 ? Math.round((done / total) * 100) : 0;

export function TrainingOverview() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const modules = useAppSelector((state) => state.trainingOverview.modules);
  const users = useAppSelector((state) => state.trainingOverview.users);
  const status = useAppSelector((state) => state.trainingOverview.status);

  const [search, setSearch] = useState("");
  const [userStatus, setUserStatus] = useState<UserStatusFilter>("active");
  const [progressStatus, setProgressStatus] = useState<UserProgressStatus[]>(
    [],
  );

  useEffect(() => {
    dispatch(fetchTrainingOverview({})).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });

    return () => {
      dispatch(reset());
    };
    // t is deliberately not a dependency: its identity changes on i18n updates,
    // and this endpoint resolves every user of the schema — one refetch per
    // language reload is not worth it. It is only read inside the error handler.
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      if (userStatus === "active" && !user.active) return false;
      if (userStatus === "inactive" && user.active) return false;

      if (term && !`${user.name} ${user.email}`.toLowerCase().includes(term)) {
        return false;
      }

      if (
        progressStatus.length &&
        !progressStatus.includes(getProgressStatus(user))
      ) {
        return false;
      }

      return true;
    });
  }, [users, search, userStatus, progressStatus]);

  // every aggregate below is computed over the filtered rows on purpose: a
  // total that disagreed with the list on screen would be worse than no total
  const summary = useMemo(
    () => ({
      total: filteredUsers.length,
      pendingMandatory: filteredUsers.filter(hasPendingMandatory).length,
      notStarted: filteredUsers.filter(
        (user) => getProgressStatus(user) === "notStarted",
      ).length,
      completed: filteredUsers.filter(
        (user) => getProgressStatus(user) === "completed",
      ).length,
    }),
    [filteredUsers],
  );

  const moduleProgress = useMemo(
    () =>
      modules.map((module) => {
        const entries = filteredUsers
          .map((user) => user.modules.find((m) => m.id === module.id))
          .filter((entry): entry is ITrainingOverviewUserModule => !!entry);

        return {
          module,
          finished: entries.filter((entry) => entry.finished).length,
          notStarted: entries.filter(
            (entry) => entry.totalLessonsFinished === 0,
          ).length,
          total: entries.length,
        };
      }),
    [modules, filteredUsers],
  );

  const statusTag = (user: ITrainingOverviewUser) => {
    const color = {
      notStarted: undefined,
      inProgress: "blue",
      completed: "green",
    }[getProgressStatus(user)];

    return (
      <Tag color={color}>
        {t(`trainingOverview.status.${getProgressStatus(user)}`)}
      </Tag>
    );
  };

  const moduleStatusTag = (entry: ITrainingOverviewUserModule) => {
    if (entry.finished) {
      return <Tag color="green">{t("trainingOverview.status.completed")}</Tag>;
    }

    // the completion record survives new lessons, so a module can be both
    // already certified and pending again
    if (entry.completedAt) {
      return <Tag color="orange">{t("trainingOverview.status.reopened")}</Tag>;
    }

    return (
      <Tag color={entry.totalLessonsFinished > 0 ? "blue" : undefined}>
        {t(
          entry.totalLessonsFinished > 0
            ? "trainingOverview.status.inProgress"
            : "trainingOverview.status.notStarted",
        )}
      </Tag>
    );
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: t("trainingOverview.columns.user"),
      key: "user",
      render: (_, user: ITrainingOverviewUser) => (
        <UserCell>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </UserCell>
      ),
    },
    {
      title: t("trainingOverview.columns.userStatus"),
      key: "active",
      width: 110,
      render: (_, user: ITrainingOverviewUser) =>
        user.active ? (
          <Tag color="green">{t("trainingOverview.filters.userActive")}</Tag>
        ) : (
          <Tag>{t("trainingOverview.filters.userInactive")}</Tag>
        ),
    },
    {
      title: t("trainingOverview.columns.mandatory"),
      key: "mandatory",
      width: 130,
      sorter: (a: any, b: any) =>
        percent(a.mandatoryFinished, a.mandatoryTotal) -
        percent(b.mandatoryFinished, b.mandatoryTotal),
      render: (_, user: ITrainingOverviewUser) =>
        user.mandatoryTotal === 0 ? (
          <span>—</span>
        ) : (
          <Tooltip title={t("trainingOverview.mandatoryHint")}>
            <MandatoryCount $pending={hasPendingMandatory(user)}>
              {user.mandatoryFinished} / {user.mandatoryTotal}
            </MandatoryCount>
          </Tooltip>
        ),
    },
    {
      title: t("trainingOverview.columns.optional"),
      key: "optional",
      width: 110,
      render: (_, user: ITrainingOverviewUser) =>
        user.optionalTotal === 0
          ? "—"
          : `${user.optionalFinished} / ${user.optionalTotal}`,
    },
    {
      title: t("trainingOverview.columns.lessons"),
      key: "lessons",
      width: 170,
      sorter: (a: any, b: any) =>
        percent(a.totalLessonsFinished, a.totalLessons) -
        percent(b.totalLessonsFinished, b.totalLessons),
      render: (_, user: ITrainingOverviewUser) => (
        <Progress
          percent={percent(user.totalLessonsFinished, user.totalLessons)}
          size="small"
          format={() => `${user.totalLessonsFinished}/${user.totalLessons}`}
        />
      ),
    },
    {
      title: t("trainingOverview.columns.lastActivity"),
      key: "lastActivity",
      width: 150,
      sorter: (a: any, b: any) =>
        (a.lastActivityAt ?? "").localeCompare(b.lastActivityAt ?? ""),
      render: (_, user: ITrainingOverviewUser) =>
        user.lastActivityAt ? formatDateTime(user.lastActivityAt) : "—",
    },
    {
      title: t("trainingOverview.columns.status"),
      key: "status",
      width: 140,
      render: (_, user: ITrainingOverviewUser) => statusTag(user),
    },
  ];

  const expandedRowRender = (user: any) => (
    <UserModuleList>
      {user.modules.map((entry: ITrainingOverviewUserModule) => {
        const module = modules.find((m) => m.id === entry.id);

        return (
          <div className="user-module-row" key={entry.id}>
            <div className="user-module-title">
              {module?.position} · {module?.title}
              {entry.mandatory && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  {t("trainingCentral.mandatoryTag")}
                </Tag>
              )}
            </div>
            <div className="user-module-lessons">
              {entry.totalLessonsFinished} / {entry.totalLessons}
            </div>
            <div className="user-module-date">
              {entry.completedAt ? formatDateTime(entry.completedAt) : "—"}
            </div>
            <div className="user-module-status">{moduleStatusTag(entry)}</div>
          </div>
        );
      })}
    </UserModuleList>
  );

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("trainingOverview.empty")}
    />
  );

  if (status === "succeeded" && !modules.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("trainingCentral.empty")}
      />
    );
  }

  return (
    <>
      <SummaryRow>
        <SummaryCard>
          <span className="summary-value">{summary.total}</span>
          <span className="summary-label">
            {t("trainingOverview.summary.users")}
          </span>
        </SummaryCard>
        <SummaryCard $alert={summary.pendingMandatory > 0}>
          <span className="summary-value">{summary.pendingMandatory}</span>
          <span className="summary-label">
            {t("trainingOverview.summary.pendingMandatory")}
          </span>
        </SummaryCard>
        <SummaryCard>
          <span className="summary-value">{summary.notStarted}</span>
          <span className="summary-label">
            {t("trainingOverview.summary.notStarted")}
          </span>
        </SummaryCard>
        <SummaryCard>
          <span className="summary-value">{summary.completed}</span>
          <span className="summary-label">
            {t("trainingOverview.summary.completed")}
          </span>
        </SummaryCard>
      </SummaryRow>

      <ModuleProgressPanel>
        <h3>{t("trainingOverview.moduleProgressTitle")}</h3>

        {moduleProgress.map(({ module, finished, notStarted, total }) => (
          <ModuleProgressRow key={module.id}>
            <div className="module-name">
              {module.position} · {module.title}
              {module.mandatory && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  {t("trainingCentral.mandatoryTag")}
                </Tag>
              )}
            </div>
            <div className="module-bar">
              <Progress
                percent={percent(finished, total)}
                size="small"
                strokeColor="#7ebe9a"
              />
            </div>
            <div className="module-count">
              {t("trainingOverview.moduleUsersFinished", {
                done: finished,
                total,
              })}
            </div>
            <div className="module-count">
              {t("trainingOverview.moduleUsersNotStarted", {
                count: notStarted,
              })}
            </div>
          </ModuleProgressRow>
        ))}
      </ModuleProgressPanel>

      <ExtraFilters>
        <div className="filter-field">
          <label>{t("trainingOverview.filters.search")}</label>
          <Input
            value={search}
            onChange={(event: any) => setSearch(event.target.value)}
            placeholder={t("trainingOverview.filters.searchPlaceholder")}
            allowClear
            style={{ minWidth: "260px" }}
          />
        </div>

        <div className="filter-field">
          <label>{t("trainingOverview.columns.userStatus")}</label>
          <Select
            value={userStatus}
            onChange={(value: any) => setUserStatus(value)}
            style={{ minWidth: "160px" }}
          >
            <Select.Option value="active">
              {t("trainingOverview.filters.active")}
            </Select.Option>
            <Select.Option value="inactive">
              {t("trainingOverview.filters.inactive")}
            </Select.Option>
            <Select.Option value="all">
              {t("trainingOverview.filters.all")}
            </Select.Option>
          </Select>
        </div>

        <div className="filter-field">
          <label>{t("trainingOverview.columns.status")}</label>
          <Select
            mode="multiple"
            value={progressStatus}
            onChange={(value: any) => setProgressStatus(value)}
            placeholder={t("trainingOverview.filters.statusPlaceholder")}
            allowClear
            style={{ minWidth: "240px" }}
          >
            <Select.Option value="notStarted">
              {t("trainingOverview.status.notStarted")}
            </Select.Option>
            <Select.Option value="inProgress">
              {t("trainingOverview.status.inProgress")}
            </Select.Option>
            <Select.Option value="completed">
              {t("trainingOverview.status.completed")}
            </Select.Option>
          </Select>
        </div>
      </ExtraFilters>

      <PageCard>
        <Table
          columns={columns}
          dataSource={filteredUsers.map((user) => ({
            ...user,
            key: user.id,
          }))}
          loading={status === "loading"}
          locale={{ emptyText }}
          pagination={false}
          expandable={{ expandedRowRender }}
        />
      </PageCard>
    </>
  );
}
