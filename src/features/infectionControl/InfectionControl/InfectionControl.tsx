import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, Empty } from "antd";
import { FileDoneOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import LoadBox, { LoadContainer } from "components/LoadBox";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

import {
  fetchAntimicrobialTimeline,
  fetchFollowUp,
  reset,
  setReviewOpen,
} from "../InfectionControlSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { CurrentCourses } from "../CurrentCourses/CurrentCourses";
import { FollowUpStatus } from "../FollowUpStatus/FollowUpStatus";
import { InfectionControlPatient } from "../InfectionControlPatient/InfectionControlPatient";
import { ReviewHistory } from "../ReviewHistory/ReviewHistory";
import { ReviewModal } from "../ReviewModal/ReviewModal";
import { getDrugNames, getFollowUpCourses } from "../followUp";
import { sortCourses } from "../timeline";
import { Header, Section, StateBox } from "./InfectionControl.style";

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
  const followUp = useAppSelector(
    (state) => state.infectionControl.followUp.data,
  );

  const isValid = /^\d+$/.test(admissionNumber);

  const load = () => {
    if (isValid) {
      dispatch(fetchAntimicrobialTimeline({ admissionNumber }));
      dispatch(fetchFollowUp({ admissionNumber }));
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
  const activeCourses = courses.filter((c) => c.status === "active");
  const drugNames = useMemo(() => getDrugNames(courses), [courses]);
  const followUpEnabled = !!followUp?.enabled;
  const followUpCourses = useMemo(
    () => (followUpEnabled ? getFollowUpCourses(followUp) : null),
    [followUp, followUpEnabled],
  );
  const canReview =
    followUpEnabled &&
    PermissionService().has(Permission.WRITE_INFECTION_CONTROL);
  // a review needs a followed admission or a running antimicrobial, and the
  // timeline loaded, since the review modal lives with it
  const showReview =
    canReview &&
    status === "succeeded" &&
    (!!followUp?.followed ||
      (followUp?.courses ?? []).some((course) => course.ongoing));

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

      <InfectionControlPatient
        patient={data.patient}
        reference={
          data.patient.dischargeDate ? dayjs(data.patient.dischargeDate) : now
        }
      />

      {followUpEnabled && followUp && (
        <FollowUpStatus followUp={followUp} drugNames={drugNames} now={now} />
      )}

      <Section data-kb="infectionControl.antimicrobials.current">
        <h2 className="section-title">{t("infectionControl.current.title")}</h2>
        <CurrentCourses
          courses={activeCourses}
          now={now}
          followUps={followUpCourses}
        />
      </Section>

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
          />
        )}
      </Section>

      {followUpEnabled && followUp && (
        <Section data-kb="infectionControl.reviews">
          <h2 className="section-title">
            {t("infectionControl.history.title")}
          </h2>
          <ReviewHistory followUp={followUp} drugNames={drugNames} />
        </Section>
      )}

      {followUp && canReview && (
        <ReviewModal followUp={followUp} drugNames={drugNames} now={now} />
      )}
    </>
  );
}
