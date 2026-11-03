import { useTranslation } from "react-i18next";

import { useIsMobile } from "hooks/useIsMobile";

import {
  CulturesAndExams,
  Section,
  SummaryCard,
} from "../InfectionControl/InfectionControl.style";
import {
  Bone,
  CourseListSkeleton,
  PaneSkeleton,
  PatientSkeleton,
  TimelineSkeleton,
} from "./InfectionControlSkeleton.style";

// the measures of the patient (InfectionControlPatient): age, sex, weight,
// height, BMI and body surface
const PATIENT_ITEMS = [72, 64, 80, 56, 72, 64];

// a couple of courses, each starting and lasting its own (left, width in px)
const COURSES = [
  { name: "62%", bar: [102, 200] },
  { name: "48%", bar: [204, 136] },
];

// enough day columns for any screen; the track hides the ones past its end
const DAYS = Array.from({ length: 48 }, (_, index) => index);

function CourseLabel({ name }: { name: string }) {
  return (
    <>
      <span className="skeleton-label-line">
        <Bone $width={22} $height={12} />
        <Bone $width={name} $height={14} />
      </span>
      <span className="skeleton-label-line">
        <Bone $width={52} $height={20} />
        <Bone $width={88} $height={12} />
      </span>
    </>
  );
}

function Pane({ rows, action }: { rows: number; action?: boolean }) {
  return (
    <PaneSkeleton>
      <div className="skeleton-pane-header">
        <Bone $width={96} $height={20} />
        {action && <Bone $width={64} $height={14} />}
      </div>
      <div className="skeleton-pane-body">
        <Bone $width="55%" $height={12} />
        {Array.from({ length: rows }, (_, index) => (
          <div className="skeleton-pane-row" key={index}>
            <Bone $width={index % 2 ? "64%" : "78%"} $height={14} />
            <Bone $width={index % 2 ? "36%" : "44%"} $height={12} />
          </div>
        ))}
      </div>
    </PaneSkeleton>
  );
}

/**
 * The infection control page while its timeline loads: the summary card, the
 * courses (a timeline, or a list on phones) and the cultures and exams, laid
 * out as they come, so the page does not jump when they do
 */
export function InfectionControlSkeleton() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <div
      data-testid="infection-control-skeleton"
      aria-busy
      aria-label={t("infectionControl.loading")}
    >
      <SummaryCard>
        <PatientSkeleton>
          <div className="skeleton-patient-header">
            <Bone $width={150} $height={18} />
            <Bone $width={104} $height={14} />
          </div>
          <div className="skeleton-patient-data">
            {PATIENT_ITEMS.map((width, index) => (
              <div className="skeleton-patient-item" key={index}>
                <Bone $width={44} $height={10} />
                <Bone $width={width} $height={14} />
              </div>
            ))}
          </div>
        </PatientSkeleton>
      </SummaryCard>

      <Section>
        {isMobile ? (
          <CourseListSkeleton>
            <div className="skeleton-list-header">
              <Bone $width={140} $height={20} />
              <Bone $width={156} $height={24} $radius={6} />
            </div>
            {COURSES.map((course, index) => (
              <div className="skeleton-course" key={index}>
                <CourseLabel name={course.name} />
              </div>
            ))}
          </CourseListSkeleton>
        ) : (
          <TimelineSkeleton>
            <div className="skeleton-gantt-header">
              <Bone $width={280} $height={22} />
              <Bone $width={108} $height={32} $radius={6} />
            </div>
            <div className="skeleton-row skeleton-row-header">
              <div className="skeleton-label" />
              <div className="skeleton-track">
                <div className="skeleton-days">
                  {DAYS.map((day) => (
                    <span className="skeleton-day" key={day}>
                      <Bone $width={14} $height={10} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {COURSES.map((course, index) => (
              <div className="skeleton-row" key={index}>
                <div className="skeleton-label">
                  <CourseLabel name={course.name} />
                </div>
                <div className="skeleton-track">
                  <Bone
                    className="skeleton-bar"
                    style={{ left: course.bar[0] }}
                    $width={course.bar[1]}
                    $height={14}
                  />
                </div>
              </div>
            ))}
          </TimelineSkeleton>
        )}
      </Section>

      <CulturesAndExams className="with-exams">
        <div className="panes">
          <Pane rows={4} />
          <Pane rows={4} action />
        </div>
      </CulturesAndExams>
    </div>
  );
}
