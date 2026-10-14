import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import FeaturesService from "services/features";

import {
  fetchCultureHistory,
  fetchRecentCultures,
  IInfectionControlPatient,
  IRecentCulture,
} from "../InfectionControlSlice";
import { CultureHistoryModal } from "./CultureHistoryModal/CultureHistoryModal";
import { CulturesByDrug } from "./CulturesByDrug/CulturesByDrug";
import { cultureColumns } from "./cultureColumns";
import {
  CulturesBox,
  CulturesError,
  CulturesHeading,
  CulturesPanes,
} from "./InfectionControlCultures.style";

interface InfectionControlCulturesProps {
  admissionNumber: string;
  patient: IInfectionControlPatient;
  // the latest prescription of the admission, whose drugs the cultures by
  // drug flag; without one there are no cultures by drug
  idPrescription: string | null;
}

/**
 * The culture exams of the patient at a glance: the latest collection of each
 * exam and material released in the last 60 days, with its gram, the
 * microorganisms of its antibiogram and the lab's result. The culture card
 * reads the same cultures by drug; this reads them by exam. Only informative:
 * loaded with the page but apart from it, and a failure stays in here.
 * A row opens every collection of its exam and material.
 *
 * For a schema with the antibiogram integration (models/Feature.CULTURE) the
 * same cultures read by drug (the culture card of the screening) sit beside
 * them, sharing the width: both views at once, stacked on a narrow section
 */
export function InfectionControlCultures({
  admissionNumber,
  patient,
  idPrescription,
}: InfectionControlCulturesProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, data } = useAppSelector(
    (state) => state.infectionControl.cultures,
  );
  // the legacy ducks are persisted untyped
  const features = useAppSelector((state: any) => state.user.account.features);

  const hasByDrug = !!idPrescription && FeaturesService(features).hasCulture();

  const columns = useMemo(
    () => cultureColumns(t, { withExam: true, stackDates: hasByDrug }),
    [t, hasByDrug],
  );

  const openHistory = (culture: IRecentCulture) => {
    dispatch(fetchCultureHistory({ admissionNumber, culture }));
  };

  const byExam = (
    <CulturesBox
      className="pane-exam"
      data-kb="infectionControl.cultures.byExam"
      data-testid="recent-cultures"
    >
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
          scroll={{ x: hasByDrug ? 640 : 900 }}
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
    </CulturesBox>
  );

  return (
    <>
      {hasByDrug && idPrescription ? (
        <>
          <h2 className="section-title">
            {t("infectionControl.cultures.title")}
          </h2>
          <CulturesPanes>
            <div className="panes">
              <CulturesHeading className="pane-exam-heading">
                <h3 className="pane-title">
                  {t("infectionControl.cultures.byExam")}
                </h3>
                <span className="legend">
                  {t("infectionControl.cultures.legend")}
                </span>
              </CulturesHeading>
              {byExam}
              <CulturesHeading className="pane-drug-heading">
                <h3 className="pane-title">
                  {t("infectionControl.cultures.byDrug")}
                </h3>
                <span className="legend">
                  {t("infectionControl.cultures.byDrugLegend")}
                </span>
              </CulturesHeading>
              <CulturesBox
                className="pane-drug by-drug"
                data-kb="infectionControl.cultures.byDrug"
                data-testid="cultures-by-drug"
              >
                <CulturesByDrug
                  patient={patient}
                  idPrescription={idPrescription}
                />
              </CulturesBox>
            </div>
          </CulturesPanes>
        </>
      ) : (
        <>
          <CulturesHeading>
            <h2 className="section-title">
              {t("infectionControl.cultures.title")}
            </h2>
            <span className="legend">
              {t("infectionControl.cultures.legend")}
            </span>
          </CulturesHeading>
          {byExam}
        </>
      )}
      <CultureHistoryModal admissionNumber={admissionNumber} />
    </>
  );
}
