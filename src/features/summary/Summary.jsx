import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import notification from "components/notification";
import LoadBox, { LoadContainer } from "components/LoadBox";

import DefaultModal from "components/Modal";

import SummaryPanelAI from "./SummaryPanelAI/SummaryPanelAI";
import SummaryPanelPatient from "./SummaryPanel/SummayPanelPatient";
import SummaryPanelAdmission from "./SummaryPanel/SummayPanelAdmission";
import SummaryPanelAttributes from "./SummaryPanel/SummayPanelPatientAttributes";
import SummaryPanelText from "./SummaryPanel/SummaryPanelText";

import SummaryTopics from "./SummaryTopics/SummaryTopics";
import SummaryActions from "./SummaryActions/SummaryActions";
import { PageHeader } from "styles/PageHeader.style";
import { SummaryContainer } from "./Summary.style";
import { fetchSummary, startBlock, setBlock, reset } from "./SummarySlice";
import {
  examsToText,
  allergiesToText,
  listToText,
  receiptToText,
  drugsUsedTotext,
} from "./verbalizers";
import pageTimer from "utils/pageTimer";

function Summary({ mock }) {
  const params = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const summaryData = useSelector((state) => state.summary.data);
  const status = useSelector((state) => state.summary.status);

  useEffect(() => {
    dispatch(
      fetchSummary({
        admissionNumber: params.admissionNumber,
        mock,
      })
    ).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      } else {
        if (!window.noharm) {
          window.noharm = {};
        }
        if (!window.noharm.pageTimer) {
          window.noharm.pageTimer = pageTimer({ debug: false });
        }

        window.noharm.pageTimer.start();

        if (response.payload.data.draft) {
          chooseLoadOption(response.payload.data.draft);
        } else {
          startLoadingBlocks();
        }
      }
    });

    return () => {
      if (window.noharm?.pageTimer) {
        window.noharm.pageTimer.stop();
      }

      dispatch(reset());
    };
  }, []); // eslint-disable-line

  const chooseLoadOption = (draft) => {
    DefaultModal.confirm({
      title: "Rascunho",
      content: <p>Existe um rascunho para este sumário. Deseja carregá-lo?</p>,
      onOk: () => {
        loadDraft(draft);
      },
      onCancel: () => {
        startLoadingBlocks();
      },
      okText: "Sim",
      cancelText: "Não",
      width: 550,
    });
  };

  const loadDraft = (value) => {
    Object.keys(value).forEach((k) => {
      dispatch(
        setBlock({
          id: k,
          data: value[k].text,
        })
      );
    });
  };

  const startLoadingBlocks = () => {
    //todo add config
    const aiBlocks = [
      "reason",
      "diagnosis",
      "previousDrugs",
      "clinicalSummary",
      "textExams",
      "procedures",
      "dischargeCondition",
      "dischargePlan",
    ];
    let timeout = 1000;
    aiBlocks.forEach((k) => {
      setTimeout(() => {
        dispatch(startBlock({ id: k }));
      }, timeout);
      timeout += 1500;
    });
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("summary.title")}</h1>
          <div className="page-header-legend">{t("summary.summaryLegend")}</div>
        </div>
        <div className="page-header-actions">
          <SummaryActions
            admissionNumber={params.admissionNumber}
            loadDraft={loadDraft}
          />
        </div>
      </PageHeader>
      {status !== "succeeded" ? (
        <LoadContainer>
          <LoadBox $absolute={true} />
        </LoadContainer>
      ) : (
        <SummaryContainer>
          <div>
            <h2 id="id-paciente">1) {t("summary.topic1")}</h2>
            <div className="sub_level">
              <SummaryPanelPatient
                position="patient"
                patient={summaryData.patient}
              ></SummaryPanelPatient>
            </div>

            <h2 id="dados-internacao">2) {t("summary.topic2")}</h2>

            <div className="sub_level">
              <SummaryPanelAdmission
                position="admission"
                patient={summaryData.patient}
              ></SummaryPanelAdmission>

              <h3 id="admissao">2.1) {t("summary.topic2-1")}</h3>

              <div className="sub_level">
                <h4 id="motivo-admissao">2.1.1) {t("summary.topic2-1-1")}</h4>
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.reason}
                  position="reason"
                />

                <h4 id="diagnosticos">2.1.2) {t("summary.topic2-1-2")}</h4>
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.diagnosis}
                  position="diagnosis"
                />

                <h4 id="alergias">2.1.3) {t("summary.topic2-1-3")}</h4>
                <SummaryPanelText
                  admissionNumber={params.admissionNumber}
                  text={allergiesToText(summaryData.allergies)}
                  position="allergies"
                ></SummaryPanelText>

                <h4 id="medicamentos-uso-previo">
                  2.1.4) {t("summary.topic2-1-4")}
                </h4>
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.previousDrugs}
                  position="previousDrugs"
                />
              </div>

              <h3 id="resumo-clinico">2.2) {t("summary.topic2-2")}</h3>

              <div className="sub_level">
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.clinicalSummary}
                  position="clinicalSummary"
                />

                <h4 id="exames-lab">2.2.1) {t("summary.topic2-2-1")}</h4>

                <SummaryPanelText
                  admissionNumber={params.admissionNumber}
                  text={examsToText(summaryData.exams)}
                  position="labExams"
                ></SummaryPanelText>

                <h4 id="exames-textuais">2.2.2) {t("summary.topic2-2-2")}</h4>
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.exams}
                  position="textExams"
                />

                <h4 id="procedimentos">2.2.3) {t("summary.topic2-2-3")}</h4>
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.procedures}
                  position="procedures"
                />

                <h4 id="medicamentos-internacao">
                  2.2.4) {t("summary.topic2-2-4")}
                </h4>
                <SummaryPanelText
                  admissionNumber={params.admissionNumber}
                  text={drugsUsedTotext(summaryData.drugsUsed)}
                  position="drugsUsed"
                ></SummaryPanelText>

                <h4 id="medicamentos-interrompidos">
                  2.2.5) {t("summary.topic2-2-5")}
                </h4>
                <SummaryPanelText
                  admissionNumber={params.admissionNumber}
                  text={listToText(summaryData.drugsSuspended, "name")}
                  position="drugsSuspended"
                ></SummaryPanelText>
              </div>

              <h3 id="condicoes-alta">2.3) {t("summary.topic2-3")}</h3>

              <div className="sub_level">
                <SummaryPanelAI
                  admissionNumber={params.admissionNumber}
                  payload={summaryData.summaryConfig?.dischargeCondition}
                  position="dischargeCondition"
                />

                <SummaryPanelAttributes
                  position="dischargeStats"
                  patient={summaryData.patient}
                ></SummaryPanelAttributes>
              </div>
            </div>

            <h2 id="plano-terapeutico">3) {t("summary.topic3")}</h2>

            <div className="sub_level">
              <h3 id="plano-alta">3.1) {t("summary.topic3-1")}</h3>
              <SummaryPanelAI
                admissionNumber={params.admissionNumber}
                payload={summaryData.summaryConfig?.dischargePlan}
                position="dischargePlan"
              />

              <h3 id="receita">3.2) {t("summary.topic3-2")}</h3>
              <SummaryPanelText
                admissionNumber={params.admissionNumber}
                text={receiptToText(summaryData.receipt)}
                position="recipe"
              ></SummaryPanelText>
            </div>
          </div>
          <div>
            <SummaryTopics />
          </div>
        </SummaryContainer>
      )}
    </>
  );
}

export default Summary;
