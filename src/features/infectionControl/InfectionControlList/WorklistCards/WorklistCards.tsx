import { useTranslation } from "react-i18next";
import { Button, Empty, Pagination, Spin, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import PatientNameCache from "components/PatientName/PatientNameCache";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate, formatDateTime } from "utils/date";

import { IFollowedAdmission, PAGE_SIZE } from "../../InfectionControlListSlice";
import { describePending } from "../../followUp";
import { Card, Cards } from "./WorklistCards.style";

interface WorklistCardsProps {
  admissions: IFollowedAdmission[];
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  patientUrl: (admission: IFollowedAdmission) => string;
  isPast: (date: string | null) => boolean;
}

/**
 * The worklist on phones: one card per patient in place of the table, which
 * does not fit the screen. Same content, top to bottom
 */
export function WorklistCards({
  admissions,
  loading,
  page,
  onPageChange,
  patientUrl,
  isPast,
}: WorklistCardsProps) {
  const { t } = useTranslation();
  const shown = admissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pagination = admissions.length > PAGE_SIZE && (
    <Pagination
      simple
      align="center"
      current={page}
      pageSize={PAGE_SIZE}
      total={admissions.length}
      showSizeChanger={false}
      onChange={onPageChange}
    />
  );

  if (!loading && admissions.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("infectionControl.worklist.empty")}
      />
    );
  }

  return (
    <Spin spinning={loading}>
      <Cards data-kb="infectionControl.worklist.list">
        {pagination}
        {shown.map((admission) => (
          <Card key={admission.admissionNumber} data-testid="worklist-card">
            <div className="card-header">
              <div className="card-patient">
                {admission.idPatient ? (
                  <PatientNameCache idPatient={admission.idPatient} />
                ) : (
                  "-"
                )}
              </div>
              <Button
                href={patientUrl(admission)}
                target="_blank"
                rel="noreferrer"
                icon={<SearchOutlined />}
                aria-label={t("infectionControl.worklist.open")}
              />
            </div>

            <div className="card-admission">
              {t("infectionControl.worklist.admission")}{" "}
              <a href={patientUrl(admission)} target="_blank" rel="noreferrer">
                {admission.admissionNumber}
              </a>
              {admission.department && <> · {admission.department}</>}
              {admission.bed && (
                <>
                  {" · "}
                  {t("infectionControl.worklist.bed")} {admission.bed}
                </>
              )}
            </div>

            <div className="card-status">
              <Tag
                color={InfectionControlStatusEnum.getColor(admission.status)}
              >
                {t(`infectionControl.followUp.status.${admission.status}`)}
              </Tag>
              <span className="muted">
                {t("infectionControl.followUp.since", {
                  date: formatDateTime(admission.statusDate),
                })}
              </span>
            </div>

            {admission.pendings.length > 0 && (
              <ul className="pendings">
                {admission.pendings.map((pending) => (
                  <li key={pending.id}>{describePending(pending, {}, t)}</li>
                ))}
              </ul>
            )}

            <dl className="card-dates">
              <div>
                <dt>{t("infectionControl.worklist.nextReview")}</dt>
                <dd
                  className={isPast(admission.nextReviewDate) ? "overdue" : ""}
                >
                  {admission.nextReviewDate
                    ? formatDate(admission.nextReviewDate)
                    : "-"}
                </dd>
              </div>
              <div>
                <dt>{t("infectionControl.worklist.validity")}</dt>
                <dd
                  className={
                    isPast(admission.earliestValidUntil) ? "overdue" : ""
                  }
                >
                  {admission.earliestValidUntil
                    ? formatDate(admission.earliestValidUntil)
                    : "-"}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
        {pagination}
      </Cards>
    </Spin>
  );
}
