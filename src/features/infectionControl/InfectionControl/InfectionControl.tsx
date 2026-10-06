import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import LoadBox, { LoadContainer } from "components/LoadBox";

import { fetchAntimicrobialTimeline, reset } from "../InfectionControlSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { CurrentCourses } from "../CurrentCourses/CurrentCourses";
import { InfectionControlPatient } from "../InfectionControlPatient/InfectionControlPatient";
import { sortCourses } from "../timeline";
import { Header, Section, StateBox } from "./InfectionControl.style";

/**
 * /controle-infeccao/:admissionNumber: the infection control view of an
 * admission. For now, its antimicrobials at a glance - the ones in use now and
 * a timeline of every course
 */
export function InfectionControl() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { admissionNumber = "" } = useParams();
  const { status, data, errorCode } = useAppSelector(
    (state) => state.infectionControl,
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
        <h1 className="page-header-title" data-kb="infectionControl.title">
          {t("infectionControl.title")}
        </h1>
        <div className="page-header-legend">
          {t("infectionControl.legend", { admissionNumber })}
        </div>
      </div>
      {data?.patient.idPrescription && (
        <div className="page-header-actions">
          <Button
            href={`/prescricao/${data.patient.idPrescription}`}
            target="_blank"
          >
            {t("infectionControl.openPrescription")}
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

      <Section data-kb="infectionControl.antimicrobials.current">
        <h2 className="section-title">{t("infectionControl.current.title")}</h2>
        <CurrentCourses courses={activeCourses} now={now} />
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
          />
        )}
      </Section>
    </>
  );
}
