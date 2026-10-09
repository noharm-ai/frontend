import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, Col, Empty } from "antd";
import {
  FileDoneOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import LoadBox, { LoadContainer } from "components/LoadBox";
import notification from "components/notification";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { getErrorMessage } from "utils/errorHandler";

import {
  fetchAntimicrobialTimeline,
  fetchFollowUp,
  followAdmission,
  reset,
  setReviewOpen,
} from "../InfectionControlSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { FollowUpStatus } from "../FollowUpStatus/FollowUpStatus";
import { InfectionControlPatient } from "../InfectionControlPatient/InfectionControlPatient";
import { ReviewModal } from "../ReviewModal/ReviewModal";
import {
  getDrugNames,
  getFollowUpCourses,
  getInvalidatedEvaluations,
} from "../followUp";
import { sortCourses } from "../timeline";
import {
  FollowUpError,
  Header,
  Section,
  StateBox,
  TopRow,
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
  const { admissionNumber = "" } = useParams();
  const { status, data, errorCode } = useAppSelector(
    (state) => state.infectionControl,
  );
  const { data: followUp, status: followUpStatus } = useAppSelector(
    (state) => state.infectionControl.followUp,
  );
  const followStatus = useAppSelector(
    (state) => state.infectionControl.follow.status,
  );

  const isValid = /^\d+$/.test(admissionNumber);

  const loadFollowUp = () => {
    dispatch(fetchFollowUp({ admissionNumber }));
  };

  const load = () => {
    if (isValid) {
      dispatch(fetchAntimicrobialTimeline({ admissionNumber }));
      loadFollowUp();
    }
  };

  useEffect(() => {
    load();

    return () => {
      dispatch(reset());
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
  const canReview =
    followUpEnabled &&
    PermissionService().has(Permission.WRITE_INFECTION_CONTROL);
  // a review needs a followed admission and the timeline loaded, since the
  // review modal lives with it
  const showReview =
    canReview && status === "succeeded" && !!followUp?.followed;
  // an admission prescalc did not follow (e.g. on antimicrobials before the
  // feature was turned on) is started by hand while a drug is running (none
  // is, once the patient is discharged)
  const showFollow =
    canReview &&
    status === "succeeded" &&
    !!followUp &&
    !followUp.followed &&
    (followUp.courses ?? []).some((course) => course.ongoing);

  const follow = () => {
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

  const header = (
    <Header>
      <div>
        <h1 className="page-header-title" data-kb="infectionControl.title">
          {t("infectionControl.title")}
        </h1>
        <div className="page-header-legend">
          {t("infectionControl.legend", { admissionNumber })}
        </div>
      </div>
      {showReview && (
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => dispatch(setReviewOpen(true))}
          >
            {t("infectionControl.followUp.register")}
          </Button>
        </div>
      )}
      {showFollow && (
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={followStatus === "loading"}
            onClick={follow}
          >
            {t("infectionControl.followUp.follow")}
          </Button>
        </div>
      )}
    </Header>
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
        <LoadContainer>
          <LoadBox $absolute={true} />
        </LoadContainer>
      </>
    );
  }

  return (
    <>
      {header}

      <TopRow gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <InfectionControlPatient
            patient={data.patient}
            reference={
              data.patient.dischargeDate
                ? dayjs(data.patient.dischargeDate)
                : now
            }
          />
        </Col>
        {followUpEnabled && followUp && (
          <Col xs={24} lg={8}>
            <FollowUpStatus
              followUp={followUp}
              drugNames={drugNames}
              now={now}
            />
          </Col>
        )}
        {followUpStatus === "failed" && (
          // without it the page would look like the schema has no follow-up
          <Col xs={24} lg={8}>
            <FollowUpError data-testid="follow-up-error">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("infectionControl.followUp.loadError")}
              />
              <Button icon={<ReloadOutlined />} onClick={loadFollowUp}>
                {t("infectionControl.retry")}
              </Button>
            </FollowUpError>
          </Col>
        )}
      </TopRow>

      <Section>
        <h2 className="section-title">
          {t("infectionControl.timeline.title")}
        </h2>
        {courses.length === 0 ? (
          <StateBox>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("infectionControl.timeline.empty")}
            />
          </StateBox>
        ) : (
          <CourseGantt
            courses={courses}
            now={now}
            dischargeDate={data.patient.dischargeDate}
            followUps={followUpCourses}
            invalidatedEvaluations={invalidatedEvaluations}
          />
        )}
      </Section>

      {followUp && canReview && (
        <ReviewModal
          followUp={followUp}
          courses={courses}
          dischargeDate={data.patient.dischargeDate}
          drugNames={drugNames}
          now={now}
        />
      )}
    </>
  );
}
