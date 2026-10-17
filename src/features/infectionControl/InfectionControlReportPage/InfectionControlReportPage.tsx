import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, Empty } from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import LoadBox, { LoadContainer } from "components/LoadBox";
import { formatDateTime } from "utils/date";

import { fetchAntimicrobialTimeline, reset } from "../InfectionControlSlice";
import { InfectionControlReport } from "../InfectionControlReport/InfectionControlReport";
import { getDrugNames } from "../followUp";
import { sortCourses } from "../timeline";
import { Header, StateBox } from "../InfectionControl/InfectionControl.style";

/**
 * /controle-infeccao/:admissionNumber/relatorio: the infection control report
 * of an admission on its own page, to read on screen and print. It loads the
 * timeline and the follow-up the same way the admission page does
 */
export function InfectionControlReportPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { admissionNumber = "" } = useParams();
  const { status, data, errorCode } = useAppSelector(
    (state) => state.infectionControl,
  );
  const followUp = useAppSelector(
    (state) => state.infectionControl.followUp.data,
  );
  const printRef = useRef<HTMLDivElement>(null);

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

  // the server judged the courses at this time, so the report uses it too
  const now = useMemo(() => (data ? dayjs(data.now) : dayjs()), [data]);
  const courses = useMemo(() => sortCourses(data?.courses ?? []), [data]);
  const drugNames = useMemo(() => getDrugNames(courses), [courses]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: t("infectionControl.report.documentTitle", {
      admissionNumber,
    }),
    pageStyle: "@page { size: A4; margin: 12mm; }",
  });

  const loaded = status === "succeeded" && !!data;

  const header = (
    <Header>
      <div>
        <h1
          className="page-header-title"
          data-kb="infectionControlReport.title"
        >
          {t("infectionControl.report.title")}
        </h1>
        <div className="page-header-legend">
          {loaded
            ? t("infectionControl.report.generatedAt", {
                admissionNumber,
                date: formatDateTime(now.toISOString()),
              })
            : t("infectionControl.legend", { admissionNumber })}
        </div>
      </div>
      <div className="page-header-actions">
        {isValid && (
          <Button
            icon={<ArrowLeftOutlined />}
            href={`/controle-infeccao/${admissionNumber}`}
          >
            {t("infectionControl.report.back")}
          </Button>
        )}
        {loaded && (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
          >
            {t("infectionControl.report.print")}
          </Button>
        )}
      </div>
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

  if (!loaded) {
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
      <div data-kb="infectionControlReport.document">
        <InfectionControlReport
          ref={printRef}
          data={data}
          followUp={followUp}
          courses={courses}
          drugNames={drugNames}
          now={now}
        />
      </div>
    </>
  );
}
