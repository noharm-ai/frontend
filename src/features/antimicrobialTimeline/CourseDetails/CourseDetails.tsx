import { useTranslation } from "react-i18next";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import { AwareTag } from "components/AwareTag/AwareTag";
import { formatDateTime } from "utils/date";

import {
  CourseStatus,
  ICourse,
  ICourseGap,
  ICourseRegimen,
} from "../AntimicrobialTimelineSlice";
import { formatDose } from "../timeline";
import { Details } from "./CourseDetails.style";

interface CourseDetailsProps {
  // the course to show; the modal is closed while it is null
  course: ICourse | null;
  now: Dayjs;
  onClose: () => void;
}

const STATUS_TAG_COLORS: Record<CourseStatus, string> = {
  active: "blue",
  suspended: "red",
  finished: "default",
};

/** Everything about one course, opened by clicking its bar on the timeline */
export function CourseDetails({ course, now, onClose }: CourseDetailsProps) {
  const { t } = useTranslation();

  if (!course) {
    return null;
  }

  const end = dayjs(course.end);
  const isCurrent = (regimen: ICourseRegimen) =>
    course.status === "active" && dayjs(regimen.end).isAfter(now);

  const regimenColumns: ColumnsType<ICourseRegimen> = [
    {
      title: t("antimicrobialTimeline.details.start"),
      key: "start",
      render: (_, regimen) => formatDateTime(regimen.start),
    },
    {
      title: t("antimicrobialTimeline.details.end"),
      key: "end",
      render: (_, regimen) => formatDateTime(regimen.end),
    },
    {
      title: t("antimicrobialTimeline.details.dose"),
      key: "dose",
      render: (_, regimen) => (
        <>
          {formatDose(regimen) ?? "-"}
          {isCurrent(regimen) && (
            <Tag color="blue" className="regimen-current">
              {t("antimicrobialTimeline.details.current")}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: t("antimicrobialTimeline.details.frequency"),
      key: "frequency",
      render: (_, regimen) => regimen.frequency || "-",
    },
    {
      title: t("antimicrobialTimeline.details.route"),
      key: "route",
      render: (_, regimen) => regimen.route || "-",
    },
  ];

  const gapColumns: ColumnsType<ICourseGap> = [
    {
      title: t("antimicrobialTimeline.details.start"),
      key: "start",
      render: (_, gap) => formatDateTime(gap.start),
    },
    {
      title: t("antimicrobialTimeline.details.end"),
      key: "end",
      render: (_, gap) => formatDateTime(gap.end),
    },
  ];

  const summary = [
    {
      label: t("antimicrobialTimeline.details.start"),
      value: formatDateTime(course.start),
    },
    {
      label: end.isAfter(now)
        ? t("antimicrobialTimeline.details.prescribedUntil")
        : t("antimicrobialTimeline.details.end"),
      value: formatDateTime(course.end),
    },
    {
      label: t("antimicrobialTimeline.details.plannedEnd"),
      value: course.plannedEnd ? formatDateTime(course.plannedEnd) : "-",
    },
    {
      label: t("antimicrobialTimeline.details.treatment"),
      value:
        course.plannedDays != null
          ? t("antimicrobialTimeline.details.daysPlanned", {
              count: course.days,
              planned: course.plannedDays,
            })
          : t("antimicrobialTimeline.details.days", { count: course.days }),
    },
    {
      label: t("antimicrobialTimeline.details.prescriptionType"),
      value: course.cpoe
        ? t("antimicrobialTimeline.details.cpoe")
        : t("antimicrobialTimeline.details.daily"),
    },
    {
      label: t("antimicrobialTimeline.details.prescriptions"),
      value: course.prescriptionCount,
    },
  ];

  return (
    <DefaultModal
      open
      onCancel={onClose}
      width={760}
      title={null}
      footer={
        <>
          <Button
            href={`/prescricao/${course.lastIdPrescription}`}
            target="_blank"
          >
            {t("antimicrobialTimeline.details.openPrescription")}
          </Button>
          <Button type="primary" onClick={onClose}>
            {t("antimicrobialTimeline.details.close")}
          </Button>
        </>
      }
    >
      <Details data-kb="antimicrobialTimeline.details">
        <header>
          <div className="details-title">
            <AwareTag level={course.atbLevel} />
            <h3>{course.drug}</h3>
          </div>
          <div className="details-subtitle">
            <Tag color={STATUS_TAG_COLORS[course.status]}>
              {t(`antimicrobialTimeline.status.${course.status}`)}
            </Tag>
            {course.substance && <span>{course.substance}</span>}
          </div>
        </header>

        <dl className="details-summary">
          {summary.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h4>
            {t("antimicrobialTimeline.details.regimens")}{" "}
            <span className="details-count">({course.regimens.length})</span>
          </h4>
          <Table
            size="small"
            pagination={false}
            columns={regimenColumns}
            dataSource={course.regimens}
            rowKey={(regimen) =>
              `${regimen.start}-${course.regimens.indexOf(regimen)}`
            }
            rowClassName={(regimen) =>
              isCurrent(regimen) ? "regimen-row-current" : ""
            }
            scroll={{ y: 280 }}
          />
        </section>

        {course.gaps.length > 0 && (
          <section>
            <h4>
              {t("antimicrobialTimeline.details.gapsTitle")}{" "}
              <span className="details-count">({course.gaps.length})</span>
            </h4>
            <Table
              size="small"
              pagination={false}
              columns={gapColumns}
              dataSource={course.gaps}
              rowKey="start"
            />
          </section>
        )}
      </Details>
    </DefaultModal>
  );
}
