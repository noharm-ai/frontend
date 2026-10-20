import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Empty, Table, Tabs, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import FeaturesService from "services/features";
import { usePatientName } from "hooks/usePatientName";
import { formatDate } from "utils/date";
import { CultureReportButton } from "features/culture/CultureReportButton/CultureReportButton";
import { fetchCultures } from "features/culture/CultureSlice";
import { isResistantInUse } from "features/culture/cultureResistance";

import {
  fetchCultureHistory,
  fetchRecentCultures,
  IInfectionControlPatient,
  IRecentCulture,
} from "../InfectionControlSlice";
import { CultureHistoryModal } from "./CultureHistoryModal/CultureHistoryModal";
import { CulturesByDrug } from "./CulturesByDrug/CulturesByDrug";
import { cultureColumns } from "./cultureColumns";
import { CulturesBox, CulturesError } from "./InfectionControlCultures.style";

interface InfectionControlCulturesProps {
  admissionNumber: string;
  patient: IInfectionControlPatient;
  // the latest prescription of the admission, whose drugs the cultures by
  // drug flag; without one there are no cultures by drug
  idPrescription: string | null;
  // beside the exams card the table is narrower: the release goes under the
  // collection
  stackDates: boolean;
}

/**
 * The culture exams of the patient at a glance, in one card: the latest
 * collection of each exam and material released in the last 60 days, with its
 * gram, the microorganisms of its antibiogram and the lab's result. Only
 * informative: loaded with the page but apart from it, and a failure stays in
 * here. A row opens its antibiogram, and a tab away every collection of its
 * exam and material.
 *
 * For a schema with the antibiogram integration (models/Feature.CULTURE) the
 * same cultures read by drug (the culture card of the screening) are a tab
 * away, and the full culture report is in the header, beside the tabs. They are loaded with the page, so the tab can say a resistant drug is
 * in use before it is opened
 */
export function InfectionControlCultures({
  admissionNumber,
  patient,
  idPrescription,
  stackDates,
}: InfectionControlCulturesProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, data } = useAppSelector(
    (state) => state.infectionControl.cultures,
  );
  const { list: culturesByDrug, status: culturesByDrugStatus } = useAppSelector(
    (state) => state.cultures,
  );
  // the legacy ducks are persisted untyped
  const features = useAppSelector((state: any) => state.user.account.features);
  const { name: patientName } = usePatientName(patient.idPatient);

  const hasByDrug = !!idPrescription && FeaturesService(features).hasCulture();

  useEffect(() => {
    // the slice skips the request while the cached list is current
    if (hasByDrug && idPrescription) {
      dispatch(fetchCultures({ idPrescription }));
    }
  }, [hasByDrug, idPrescription, culturesByDrugStatus, dispatch]);

  // the fields of the prescription the culture report reads
  const reportPrescription = useMemo(
    () => ({
      idPrescription,
      idPatient: patient.idPatient,
      admissionNumber: patient.admissionNumber,
      namePatient: patientName,
      birthdateFormat: formatDate(patient.birthdate) ?? "",
    }),
    [idPrescription, patient, patientName],
  );

  const resistantInUse = hasByDrug
    ? (culturesByDrug ?? []).filter(isResistantInUse).length
    : 0;

  const columns = useMemo(
    () => cultureColumns(t, { withExam: true, stackDates }),
    [t, stackDates],
  );

  const openHistory = (culture: IRecentCulture) => {
    dispatch(fetchCultureHistory({ admissionNumber, culture }));
  };

  const byExam = (
    <div
      className="culture-pane"
      data-kb="infectionControl.cultures.byExam"
      data-testid="recent-cultures"
    >
      <div className="legend">{t("infectionControl.cultures.legend")}</div>
      {status === "failed" ? (
        <CulturesError>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("infectionControl.cultures.loadError")}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchRecentCultures({ admissionNumber }))}
          >
            {t("infectionControl.retry")}
          </Button>
        </CulturesError>
      ) : (
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={data?.cultures ?? []}
          loading={status === "loading" || status === "idle"}
          pagination={false}
          // the columns stay over the rows as the card scrolls them
          sticky
          scroll={{ x: stackDates ? 640 : 900 }}
          rowClassName="culture-row"
          onRow={(culture) => ({
            tabIndex: 0,
            title: t("infectionControl.cultures.openHistory"),
            onClick: () => openHistory(culture),
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openHistory(culture);
              }
            },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("infectionControl.cultures.empty")}
              />
            ),
          }}
        />
      )}
    </div>
  );

  const title = (
    <h2 className="section-title">{t("infectionControl.cultures.title")}</h2>
  );

  return (
    <CulturesBox>
      {hasByDrug && idPrescription ? (
        <Tabs
          defaultActiveKey="summary"
          tabBarExtraContent={{
            left: title,
            // the full report, whichever view is open
            right: <CultureReportButton prescription={reportPrescription} />,
          }}
          items={[
            {
              key: "summary",
              label: t("infectionControl.cultures.summary"),
              children: byExam,
            },
            {
              key: "byDrug",
              label:
                resistantInUse > 0 ? (
                  // a resistance the patient is being given is not left for
                  // the user to find behind the tab
                  <Tooltip
                    title={t("culture.resistantInUseTabHint", {
                      count: resistantInUse,
                    })}
                  >
                    <Badge dot offset={[5, 2]}>
                      <span data-testid="cultures-by-drug-alert">
                        {t("infectionControl.cultures.byDrug")}
                      </span>
                    </Badge>
                  </Tooltip>
                ) : (
                  t("infectionControl.cultures.byDrug")
                ),
              children: (
                <div
                  className="culture-pane by-drug"
                  data-kb="infectionControl.cultures.byDrug"
                  data-testid="cultures-by-drug"
                >
                  <div className="legend">
                    {t("infectionControl.cultures.byDrugLegend")}
                  </div>
                  <CulturesByDrug idPrescription={idPrescription} />
                </div>
              ),
            },
          ]}
        />
      ) : (
        <>
          <div className="cultures-header">{title}</div>
          <div className="cultures-body">{byExam}</div>
        </>
      )}
      <CultureHistoryModal admissionNumber={admissionNumber} />
    </CulturesBox>
  );
}
