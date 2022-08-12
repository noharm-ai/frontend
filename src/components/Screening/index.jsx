import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Empty from "components/Empty";
import LoadBox, { LoadContainer } from "components/LoadBox";
import { Row, Col } from "components/Grid";
import Tabs from "components/Tabs";
import Tag from "components/Tag";
import notification from "components/notification";
import BackTop from "components/BackTop";
import Button from "components/Button";
import Icon from "components/Icon";

import PrescriptionList from "containers/Screening/PrescriptionDrug/PrescriptionList";
import SolutionList from "containers/Screening/PrescriptionDrug/SolutionList";
import ProcedureList from "containers/Screening/PrescriptionDrug/ProcedureList";
import DietList from "containers/Screening/PrescriptionDrug/DietList";
import PreviousInterventionList from "containers/Screening/PreviousInterventionList";
import PageHeader from "containers/Screening/PageHeader";
import Patient from "containers/Screening/Patient";
import PrescriptionDrugForm from "containers/Forms/PrescriptionDrug";

import {
  BoxWrapper,
  ScreeningTabs,
  PrescriptionActionContainer,
} from "./index.style";

export default function Screening({
  fetchScreeningById,
  isFetching,
  content,
  error,
  selectPrescriptionDrug,
  security,
}) {
  const params = useParams();
  const id = params?.slug;
  const {
    prescriptionCount,
    solutionCount,
    proceduresCount,
    dietCount,
    interventionsRaw: interventionList,
    agg,
  } = content;

  const { t } = useTranslation();

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  const listCount = {
    prescriptions: prescriptionCount,
    solutions: solutionCount,
    procedures: proceduresCount,
    diet: dietCount,
    interventions: interventionList ? interventionList.length : 0,
  };

  const fixedTabs = 2;
  const tabCount =
    fixedTabs +
    (listCount.procedures > 0 ? 1 : 0) +
    (listCount.diet > 0 ? 1 : 0);

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  const TabTitle = ({ title, count, ...props }) => (
    <>
      <span style={{ marginRight: "10px" }}>{title}</span>
      {count >= 0 ? <Tag {...props}>{count}</Tag> : null}
    </>
  );

  const addPrescriptionDrug = (source) => {
    selectPrescriptionDrug({
      idPrescription: content.idPrescription,
      idSegment: content.idSegment,
      idHospital: content.idHospital,
      source,
      updateDrug: true,
    });
  };

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={error.message}
        id="gtm-prescription-error"
      />
    );
  }

  return (
    <>
      <BoxWrapper>
        <PageHeader />
        <Row type="flex" gutter={24}>
          <Col span={24} md={24}>
            {isFetching ? (
              <LoadContainer>
                <LoadBox absolute={true} />
              </LoadContainer>
            ) : (
              <Patient interventionCount={listCount.interventions} />
            )}
          </Col>
        </Row>
      </BoxWrapper>

      <Row type="flex" gutter={24}>
        <ScreeningTabs
          defaultActiveKey="1"
          style={{ width: "100%", padding: "10px", marginTop: "10px" }}
          type="card"
          className={`breaktab-${tabCount}`}
        >
          <Tabs.TabPane
            tab={
              <TabTitle
                title={t("screeningBody.tabDrugs")}
                count={listCount.prescriptions}
              />
            }
            key="drugs"
          >
            <Col span={24} md={24} style={{ marginTop: "20px" }}>
              {!isEmpty(content) && security.hasPrescriptionEdit() && !agg && (
                <PrescriptionActionContainer>
                  <Button
                    onClick={() => addPrescriptionDrug("prescription")}
                    className="gtm-bt-add-drugEdit"
                    type="primary"
                  >
                    <Icon type="plus" />
                    {t("screeningBody.btnAddDrug")}
                  </Button>
                </PrescriptionActionContainer>
              )}

              <PrescriptionList
                emptyMessage="Nenhum medicamento encontrado."
                hasFilter
                listType="prescription"
              />
            </Col>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <TabTitle
                title={t("screeningBody.tabSolutions")}
                count={listCount.solutions}
              />
            }
            key="solutions"
          >
            <Col span={24} md={24} style={{ marginTop: "20px" }}>
              <SolutionList
                emptyMessage="Nenhuma solução encontrada."
                hasFilter={false}
                listType="solution"
              />
            </Col>
          </Tabs.TabPane>
          {listCount.procedures > 0 && (
            <Tabs.TabPane
              tab={
                <TabTitle
                  title={t("screeningBody.tabProcedures")}
                  count={listCount.procedures}
                />
              }
              key="procedures"
            >
              <Col span={24} md={24} style={{ marginTop: "20px" }}>
                <ProcedureList
                  emptyMessage="Nenhuma solução encontrada."
                  hasFilter={false}
                  listType="procedure"
                />
              </Col>
            </Tabs.TabPane>
          )}
          {listCount.diet > 0 && (
            <Tabs.TabPane
              tab={
                <TabTitle
                  title={t("screeningBody.tabDiet")}
                  count={listCount.diet}
                />
              }
              key="diet"
            >
              <Col span={24} md={24} style={{ marginTop: "20px" }}>
                <DietList
                  emptyMessage="Nenhuma dieta encontrada."
                  hasFilter={false}
                  listType="diet"
                />
              </Col>
            </Tabs.TabPane>
          )}
          <Tabs.TabPane
            tab={
              <TabTitle
                title={t("screeningBody.tabInterventions")}
                count={listCount.interventions}
              />
            }
            key="intervention"
          >
            <div style={{ marginTop: "20px" }}>
              <PreviousInterventionList />
            </div>
          </Tabs.TabPane>
        </ScreeningTabs>
      </Row>

      <PrescriptionDrugForm />
      <BackTop />
    </>
  );
}
