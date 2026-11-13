import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Affix, Button, Dropdown, Empty, Segmented } from "antd";
import type { MenuProps } from "antd";
import {
  ArrowRightOutlined,
  DownOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import PatientNameCache from "components/PatientName/PatientNameCache";
import notification from "components/notification";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { getErrorMessage } from "utils/errorHandler";
import ExamsModal from "features/exams/ExamModal/ExamModal";
import { setExamsModalAdmissionNumber } from "features/exams/ExamModal/ExamModalSlice";
import { useIsMobile } from "hooks/useIsMobile";
import {
  trackInfectionControlAction,
  TrackedInfectionControlAction,
} from "src/utils/tracker";

import {
  fetchAntimicrobialTimeline,
  fetchExamHistory,
  fetchFollowUp,
  fetchRecentCultures,
  followAdmission,
  ICultureCollection,
  reset,
  setReviewOpen,
} from "../InfectionControlSlice";
import { collectionsOf } from "../InfectionControlCultures/cultureCollections";
import {
  fetchNextPending,
  filtersFromSearch,
} from "../InfectionControlListSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { CourseList } from "../CourseList/CourseList";
import { FollowUpStatus } from "../FollowUpStatus/FollowUpStatus";
import { InfectionControlClinicalNotes } from "../InfectionControlClinicalNotes/InfectionControlClinicalNotes";
import { InfectionControlCultures } from "../InfectionControlCultures/InfectionControlCultures";
import { InfectionControlExams } from "../InfectionControlExams/InfectionControlExams";
import { InfectionControlPatient } from "../InfectionControlPatient/InfectionControlPatient";
import { InfectionControlReportModal } from "../InfectionControlReportModal/InfectionControlReportModal";
import { InfectionControlSkeleton } from "../InfectionControlSkeleton/InfectionControlSkeleton";
import { Bone } from "../InfectionControlSkeleton/InfectionControlSkeleton.style";
import { ReviewModal } from "../ReviewModal/ReviewModal";
import {
  getDrugNames,
  getFollowUpCourses,
  getInvalidatedEvaluations,
} from "../followUp";
import { sortCourses } from "../timeline";
import { getDefaultExamIds, getExamOptions, toExamSeries } from "../exams";
import {
  CulturesAndExams,
  FollowUpError,
  Header,
  Section,
  StateBox,
  SummaryCard,
} from "./InfectionControl.style";

/**
 * /controle-infeccao/:admissionNumber: the infection control view of an
 * admission. Its antimicrobials at a glance - the ones in use now and a
 * timeline of every course - and, when the schema has the feature, the
 * follow-up: status, pending reasons, reviews and the conformity of each drug
 */
export function InfectionControl() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { admissionNumber = "" } = useParams();
  // the worklist filters the page was opened with (filtersToSearch)
  const [searchParams] = useSearchParams();
  const { status, data, errorCode } = useAppSelector(
    (state) => state.infectionControl,
  );
  const { data: followUp, status: followUpStatus } = useAppSelector(
    (state) => state.infectionControl.followUp,
  );
  const { data: cultures, status: culturesStatus } = useAppSelector(
    (state) => state.infectionControl.cultures,
  );
  const followStatus = useAppSelector(
    (state) => state.infectionControl.follow.status,
  );
  const examHistory = useAppSelector(
    (state) => state.infectionControl.examHistory,
  );
  // the culture open in the drawer of the culture card, which the timeline
  // opens too
  const [openCultureId, setOpenCultureId] = useState<string | null>(null);
  const cultureCollections = useMemo(
    () => (culturesStatus === "succeeded" ? collectionsOf(cultures) : []),
    [cultures, culturesStatus],
  );
  const openCultureFromTimeline = useCallback(
    (collection: ICultureCollection) => {
      trackInfectionControlAction(
        TrackedInfectionControlAction.OPEN_CULTURE_HISTORY,
        { source: "timeline" },
      );
      setOpenCultureId(collection.id);
    },
    [],
  );

  const [clinicalNotesOpen, setClinicalNotesOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [affixed, setAffixed] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  // phones show the courses as a list, the timeline being too wide to read;
  // it is still one tap away
  const [coursesView, setCoursesView] = useState<"list" | "timeline">("list");
  // the exams on the timeline, by IExamOption id; null until one is added or
  // taken out, the default ones (getDefaultExamIds) meanwhile
  const [examIds, setExamIds] = useState<string[] | null>(null);

  const isValid = /^\d+$/.test(admissionNumber);

  // the follow-up comes with the timeline; it is loaded alone only to retry
  // it. The cultures are loaded apart, alongside, and retried by their section
  const load = () => {
    if (isValid) {
      dispatch(fetchAntimicrobialTimeline({ admissionNumber }));
      dispatch(fetchRecentCultures({ admissionNumber }));
    }
  };

  const loadFollowUp = () => {
    dispatch(fetchFollowUp({ admissionNumber }));
  };

  useEffect(() => {
    load();

    return () => {
      dispatch(reset());
      setClinicalNotesOpen(false);
      setReportOpen(false);
      setExamIds(null);
      dispatch(setExamsModalAdmissionNumber(null));
    };
  }, [admissionNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // the server judged the courses at this time, so the timeline uses it too
  const now = useMemo(() => (data ? dayjs(data.now) : dayjs()), [data]);
  const courses = useMemo(() => sortCourses(data?.courses ?? []), [data]);
  const drugNames = useMemo(() => getDrugNames(courses), [courses]);
  const followUpEnabled = !!followUp?.enabled;
  const followUpCourses = useMemo(
    () => (followUpEnabled ? getFollowUpCourses(followUp) : null),
    [followUp, followUpEnabled],
  );
  const invalidatedEvaluations = useMemo(
    () => getInvalidatedEvaluations(followUp),
    [followUp],
  );
  // registering a review takes WRITE; going through one, to see what it would
  // evaluate, only READ
  const canSaveReview =
    followUpEnabled &&
    PermissionService().has(Permission.WRITE_INFECTION_CONTROL);
  const canReview =
    canSaveReview ||
    (followUpEnabled &&
      PermissionService().has(Permission.READ_INFECTION_CONTROL));
  // a review needs a followed admission and the timeline loaded, since the
  // review modal lives with it
  const showReview =
    canReview && status === "succeeded" && !!followUp?.followed;
  // an admission prescalc did not follow (e.g. on antimicrobials before the
  // feature was turned on) is started by hand while a drug is running (none
  // is, once the patient is discharged)
  const showFollow =
    canSaveReview &&
    status === "succeeded" &&
    !!followUp &&
    !followUp.followed &&
    (followUp.courses ?? []).some((course) => course.ongoing);

  // an admission with no prescription has no segment to read the exam
  // references from
  const hasExams = !!data?.patient.idPrescription;

  const loadExamHistory = () => {
    dispatch(
      fetchExamHistory({
        admissionNumber,
        idSegment: data?.patient.idSegment ?? null,
      }),
    );
  };

  // the timeline plots some exams under the courses (getTimelineExams), from
  // the history "Ver todos" shows: loaded once the timeline brings the segment
  // to read their references from. A reset (another admission) makes it idle
  // again
  useEffect(() => {
    if (status === "succeeded" && hasExams && examHistory.status === "idle") {
      loadExamHistory();
    }
  }, [status, hasExams, examHistory.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const examOptions = useMemo(
    () => getExamOptions(examHistory.list),
    [examHistory.list],
  );
  const timelineExams = useMemo(() => {
    if (!hasExams) return null;

    const ids = examIds ?? getDefaultExamIds(examOptions);
    const plotted = ids
      .map((id) => examOptions.find((option) => option.id === id))
      .filter((option) => !!option);

    return {
      series: plotted.map(toExamSeries),
      options: examOptions.filter((option) => !ids.includes(option.id)),
      status: examHistory.status,
      onAdd: (id: string) => {
        trackInfectionControlAction(
          TrackedInfectionControlAction.ADD_TIMELINE_EXAM,
        );
        setExamIds([...ids, id]);
      },
      onRemove: (id: string) => {
        trackInfectionControlAction(
          TrackedInfectionControlAction.REMOVE_TIMELINE_EXAM,
        );
        setExamIds(ids.filter((item) => item !== id));
      },
      onRetry: loadExamHistory,
    };
  }, [hasExams, examIds, examOptions, examHistory.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // the next one of the worklist the page came from, by its filters
  const showNextPending =
    followUpEnabled &&
    PermissionService().has(Permission.READ_INFECTION_CONTROL);

  const goToNextPending = () => {
    trackInfectionControlAction(TrackedInfectionControlAction.NEXT_PENDING);
    setNextLoading(true);
    dispatch(
      fetchNextPending({
        admissionNumber: Number(admissionNumber),
        filters: filtersFromSearch(searchParams),
      }),
    ).then((response: any) => {
      setNextLoading(false);
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else if (response.payload === null) {
        notification.info({ message: t("infectionControl.nextPendingEmpty") });
      } else {
        navigate({
          pathname: `/controle-infeccao/${response.payload}`,
          search: searchParams.toString(),
        });
        window.scrollTo({ top: 0 });
      }
    });
  };

  const follow = () => {
    trackInfectionControlAction(TrackedInfectionControlAction.FOLLOW_ADMISSION);
    dispatch(followAdmission({ admissionNumber })).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: t("infectionControl.followUp.followSuccess"),
        });
      }
    });
  };

  // the report opens from the actions menu and from the review history
  const openReport = (origin: "menu" | "history") => {
    trackInfectionControlAction(TrackedInfectionControlAction.OPEN_REPORT, {
      origin,
    });
    setReportOpen(true);
  };

  // the secondary actions, grouped so the header keeps Revisar and Evoluções
  // in sight
  const moreActions: MenuProps["items"] = [
    {
      key: "report",
      icon: <PrinterOutlined />,
      label: (
        <span data-kb="infectionControl.reportButton">
          {t("infectionControl.report.open")}
        </span>
      ),
    },
    ...(showFollow
      ? [
          {
            key: "follow",
            icon: <PlayCircleOutlined />,
            disabled: followStatus === "loading",
            label: t("infectionControl.followUp.follow"),
          },
        ]
      : []),
    ...(showNextPending
      ? [
          {
            key: "nextPending",
            icon: <ArrowRightOutlined />,
            disabled: nextLoading,
            label: (
              <span data-kb="infectionControl.nextPending">
                {t("infectionControl.nextPending")}
              </span>
            ),
          },
        ]
      : []),
  ];

  const onMoreAction: MenuProps["onClick"] = ({ key }) => {
    if (key === "report") {
      openReport("menu");
    } else if (key === "follow") {
      follow();
    } else if (key === "nextPending") {
      goToNextPending();
    }
  };

  // phones never stick it (below), even when resized from a stuck desktop
  const isAffixed = affixed && !isMobile;

  const headerContent = (
    <Header className={isAffixed ? "affixed" : ""}>
      <div>
        <h1 className="page-header-title" data-kb="infectionControl.title">
          {t("infectionControl.title")}
        </h1>
        <div className="page-header-legend">
          {t("infectionControl.legend", { admissionNumber })}
          {isAffixed && data && (
            <>
              {" - "}
              <PatientNameCache idPatient={data.patient.idPatient} />
            </>
          )}
        </div>
      </div>
      {status === "succeeded" && data && (
        <div className="page-header-actions">
          {showReview && (
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={() => {
                trackInfectionControlAction(
                  TrackedInfectionControlAction.OPEN_REVIEW,
                );
                dispatch(setReviewOpen(true));
              }}
            >
              {t("infectionControl.followUp.register")}
            </Button>
          )}
          <Button
            icon={<FileTextOutlined />}
            onClick={() => {
              trackInfectionControlAction(
                TrackedInfectionControlAction.OPEN_CLINICAL_NOTES,
              );
              setClinicalNotesOpen(true);
            }}
          >
            {t("infectionControl.clinicalNotes")}
          </Button>
          <Dropdown
            trigger={["click"]}
            menu={{ items: moreActions, onClick: onMoreAction }}
          >
            <Button
              data-kb="infectionControl.moreActions"
              icon={<DownOutlined />}
              iconPlacement="end"
              loading={nextLoading || followStatus === "loading"}
            >
              {t("infectionControl.moreActions")}
            </Button>
          </Dropdown>
        </div>
      )}
      {/* the actions keep their place while the timeline loads (wrapped below
          the title on phones) */}
      {(status === "idle" || status === "loading") && isValid && (
        <div
          className="page-header-actions header-actions-skeleton"
          aria-hidden
        >
          <Bone $width={120} $height={32} $radius={6} />
          <Bone $width={124} $height={32} $radius={6} />
        </div>
      )}
    </Header>
  );

  // on phones the actions wrap below the title: stuck to the top they would
  // cover too much of the screen
  const header = isMobile ? (
    headerContent
  ) : (
    <Affix onChange={(value) => setAffixed(!!value)}>{headerContent}</Affix>
  );

  const coursesViewToggle = isMobile && (
    <Segmented<"list" | "timeline">
      size="small"
      value={coursesView}
      onChange={(view) => {
        trackInfectionControlAction(
          TrackedInfectionControlAction.CHANGE_COURSES_VIEW,
          { view },
        );
        setCoursesView(view);
      }}
      options={[
        { value: "list", label: t("infectionControl.timeline.viewList") },
        {
          value: "timeline",
          label: t("infectionControl.timeline.viewTimeline"),
        },
      ]}
    />
  );

  const notFound =
    !isValid || (status === "failed" && errorCode === "errors.invalidRecord");

  if (notFound || status === "failed") {
    return (
      <>
        {header}
        <StateBox>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t(
              notFound
                ? "infectionControl.notFound"
                : "infectionControl.loadError",
              { admissionNumber },
            )}
          />
          {!notFound && (
            <Button icon={<ReloadOutlined />} onClick={load}>
              {t("infectionControl.retry")}
            </Button>
          )}
        </StateBox>
      </>
    );
  }

  if (status !== "succeeded" || !data) {
    return (
      <>
        {header}
        <InfectionControlSkeleton />
      </>
    );
  }

  return (
    <>
      {header}

      <SummaryCard>
        <InfectionControlPatient
          patient={data.patient}
          reference={
            data.patient.dischargeDate ? dayjs(data.patient.dischargeDate) : now
          }
        />
        {followUpEnabled && followUp && (
          <FollowUpStatus
            followUp={followUp}
            drugNames={drugNames}
            now={now}
            onOpenReport={() => openReport("history")}
          />
        )}
        {followUpStatus === "failed" && (
          // without it the page would look like the schema has no follow-up
          <FollowUpError data-testid="follow-up-error">
            <span>{t("infectionControl.followUp.loadError")}</span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadFollowUp}
            >
              {t("infectionControl.retry")}
            </Button>
          </FollowUpError>
        )}
      </SummaryCard>

      <Section>
        {courses.length === 0 ? (
          <>
            <h2 className="section-title">
              {t("infectionControl.timeline.title")}
            </h2>
            <StateBox>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("infectionControl.timeline.empty")}
              />
            </StateBox>
          </>
        ) : isMobile && coursesView === "list" ? (
          <CourseList
            courses={courses}
            now={now}
            followUps={followUpCourses}
            invalidatedEvaluations={invalidatedEvaluations}
            actions={coursesViewToggle}
          />
        ) : (
          // the timeline carries its own title, next to its actions
          <CourseGantt
            courses={courses}
            now={now}
            dischargeDate={data.patient.dischargeDate}
            followUps={followUpCourses}
            invalidatedEvaluations={invalidatedEvaluations}
            actions={coursesViewToggle}
            exams={timelineExams}
            cultures={cultureCollections}
            onOpenCulture={openCultureFromTimeline}
          />
        )}
      </Section>

      <CulturesAndExams className={hasExams ? "with-exams" : ""}>
        <div className="panes">
          <div data-kb="infectionControl.cultures">
            <InfectionControlCultures
              admissionNumber={admissionNumber}
              patient={data.patient}
              idPrescription={data.patient.idPrescription}
              openId={openCultureId}
              onOpenIdChange={setOpenCultureId}
            />
          </div>
          {hasExams && (
            <div data-kb="infectionControl.exams">
              <InfectionControlExams
                patient={data.patient}
                exams={data.exams}
                alertExams={data.alertExams}
              />
            </div>
          )}
        </div>
      </CulturesAndExams>

      <InfectionControlClinicalNotes
        admissionNumber={data.patient.admissionNumber}
        open={clinicalNotesOpen}
        onClose={() => setClinicalNotesOpen(false)}
      />
      <ExamsModal idSegment={data.patient.idSegment ?? undefined} />
      <InfectionControlReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        data={data}
        followUp={followUp}
        courses={courses}
        drugNames={drugNames}
        // the report tells apart the cultures it could not include
        cultures={
          culturesStatus === "succeeded" ? (cultures?.cultures ?? []) : null
        }
        now={now}
      />

      {followUp && canReview && (
        <ReviewModal
          followUp={followUp}
          timeline={data}
          courses={courses}
          dischargeDate={data.patient.dischargeDate}
          drugNames={drugNames}
          now={now}
          canSave={canSaveReview}
        />
      )}
    </>
  );
}
