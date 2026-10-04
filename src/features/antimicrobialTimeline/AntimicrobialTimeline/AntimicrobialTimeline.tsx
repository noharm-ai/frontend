import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import LoadBox, { LoadContainer } from "components/LoadBox";

import {
  fetchAntimicrobialTimeline,
  reset,
} from "../AntimicrobialTimelineSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { CurrentCourses } from "../CurrentCourses/CurrentCourses";
import { TimelinePatient } from "../TimelinePatient/TimelinePatient";
import { sortCourses } from "../timeline";
import { Header, Section, StateBox } from "./AntimicrobialTimeline.style";

/**
 * /antimicrobianos/:admissionNumber: the antimicrobials of an admission at a
 * glance - the ones in use now and a timeline of every course
 */
export function AntimicrobialTimeline() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { admissionNumber = "" } = useParams();
  const { status, data, errorCode } = useAppSelector(
    (state) => state.antimicrobialTimeline,
  );

  const isValid = /^\d+$/.test(admissionNumber);

  const load = () => {
    if (isValid) {
      dispatch(fetchAntimicrobialTimeline({ admissionNumber }));
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

  const header = (
    <Header>
      <div>
        <h1 className="page-header-title" data-kb="antimicrobialTimeline.title">
          {t("antimicrobialTimeline.title")}
        </h1>
        <div className="page-header-legend">
          {t("antimicrobialTimeline.legend", { admissionNumber })}
        </div>
      </div>
      {data?.patient.idPrescription && (
        <div className="page-header-actions">
          <Button
            href={`/prescricao/${data.patient.idPrescription}`}
            target="_blank"
          >
            {t("antimicrobialTimeline.openPrescription")}
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
                ? "antimicrobialTimeline.notFound"
                : "antimicrobialTimeline.loadError",
              { admissionNumber },
            )}
          />
          {!notFound && (
            <Button icon={<ReloadOutlined />} onClick={load}>
              {t("antimicrobialTimeline.retry")}
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

      <TimelinePatient
        patient={data.patient}
        reference={
          data.patient.dischargeDate ? dayjs(data.patient.dischargeDate) : now
        }
      />

      <Section data-kb="antimicrobialTimeline.current">
        <h2 className="section-title">
          {t("antimicrobialTimeline.current.title")}
        </h2>
        <CurrentCourses courses={activeCourses} now={now} />
      </Section>

      <Section>
        <h2 className="section-title">
          {t("antimicrobialTimeline.timeline.title")}
        </h2>
        {courses.length === 0 ? (
          <StateBox>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("antimicrobialTimeline.timeline.empty")}
            />
          </StateBox>
        ) : (
          <CourseGantt
            courses={courses}
            now={now}
            dischargeDate={data.patient.dischargeDate}
          />
        )}
      </Section>
    </>
  );
}
