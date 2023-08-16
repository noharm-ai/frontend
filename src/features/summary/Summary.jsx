import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Anchor } from "antd";

import notification from "components/notification";
import LoadBox, { LoadContainer } from "components/LoadBox";
import Button from "components/Button";

import SummaryPanelAI from "./SummaryPanelAI/SummaryPanelAI";
import SummaryPanelPatient from "./SummaryPanel/SummayPanelPatient";
import SummaryPanelAdmission from "./SummaryPanel/SummayPanelAdmission";
import SummaryPanelAttributes from "./SummaryPanel/SummayPanelPatientAttributes";
import SummaryPanelText from "./SummaryPanel/SummaryPanelText";
import SummaryText from "./SummaryText/SummaryText";
import { PageHeader } from "styles/PageHeader.style";
import { SummaryContainer } from "./Summary.style";
import { fetchSummary, startBlock } from "./SummarySlice";
import {
  examsToText,
  allergiesToText,
  listToText,
  receiptToText,
} from "./verbalizers";

function Summary({ mock }) {
  const params = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const summaryData = useSelector((state) => state.summary.data);
  const status = useSelector((state) => state.summary.status);

  const [modalText, setModalText] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      dispatch(
        fetchSummary({
          admissionNumber: params.admissionNumber,
          mock,
        })
      ).then(() => {
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
      });
    }
  }, [status, dispatch, params.admissionNumber, mock]);

  if (status === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Sumário de Alta</h1>
          <div className="page-header-legend">Sumário de alta do paciente.</div>
        </div>
        <div className="page-header-actions">
          <Button type="primary" onClick={() => setModalText(true)}>
            Gerar Texto
          </Button>
        </div>
      </PageHeader>
      {status !== "succeeded" ? (
        <LoadContainer>
          <LoadBox absolute={true} />
        </LoadContainer>
      ) : (
        <SummaryContainer>
          <div>
            <h2 id="id-paciente">1) Identificação do Paciente</h2>
            <div className="sub_level">
              <SummaryPanelPatient
                position="patient"
                patient={summaryData.patient}
              ></SummaryPanelPatient>
            </div>

            <h2 id="dados-internacao">2) Dados da Internação</h2>

            <div className="sub_level">
              <SummaryPanelAdmission
                position="admission"
                patient={summaryData.patient}
              ></SummaryPanelAdmission>

              <h3 id="admissao">2.1) Admissão</h3>

              <div className="sub_level">
                <h4 id="motivo-admissao">2.1.1) Motivo da Admissão</h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.reason}
                  position="reason"
                />

                <h4 id="diagnosticos">
                  2.1.2) Diagnósticos (primário e secundário)
                </h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.diagnosis}
                  position="diagnosis"
                />

                <h4 id="alergias">2.1.3) Alergias</h4>
                <SummaryPanelText
                  text={allergiesToText(summaryData.allergies)}
                  position="allergies"
                ></SummaryPanelText>

                <h4 id="medicamentos-uso-previo">
                  2.1.4) Medicamentos de uso prévio
                </h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.previousDrugs}
                  position="previousDrugs"
                />
              </div>

              <h3 id="resumo-clinico">2.2) Resumo Clínico</h3>

              <div className="sub_level">
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.clinicalSummary}
                  position="clinicalSummary"
                />

                <h4 id="exames-lab">2.2.1) Exames Laboratoriais</h4>

                <SummaryPanelText
                  text={examsToText(summaryData.exams)}
                  position="labExams"
                ></SummaryPanelText>

                <h4 id="exames-textuais">2.2.2) Exames Textuais</h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.exams}
                  position="textExams"
                />

                <h4 id="procedimentos">2.2.3) Procedimentos realizados</h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.procedures}
                  position="procedures"
                />

                <h4 id="medicamentos-internacao">
                  2.2.4) Medicamentos utilizados na internação
                </h4>
                <SummaryPanelText
                  text={listToText(summaryData.drugsUsed, "name")}
                  position="drugsUsed"
                ></SummaryPanelText>

                <h4 id="medicamentos-interrompidos">
                  2.2.5) Medicamentos Contínuos Interrompidos Durante a
                  Internação
                </h4>
                <SummaryPanelText
                  text={listToText(summaryData.drugsSuspended, "name")}
                  position="drugsSuspended"
                ></SummaryPanelText>
              </div>

              <h3 id="condicoes-alta">2.3) Condição de Alta</h3>

              <div className="sub_level">
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.dischargeCondition}
                  position="dischargeCondition"
                />

                <SummaryPanelAttributes
                  position="dischargeStats"
                  patient={summaryData.patient}
                ></SummaryPanelAttributes>
              </div>
            </div>

            <h2 id="plano-terapeutico">3) Plano Terapêutico</h2>

            <div className="sub_level">
              <h3 id="plano-alta">3.1) Plano de Alta</h3>
              <SummaryPanelAI
                url={summaryData.summaryConfig?.url}
                apikey={summaryData.summaryConfig?.apikey}
                payload={summaryData.summaryConfig?.dischargePlan}
                position="dischargePlan"
              />

              <h3 id="receita">3.2) Receita</h3>
              <SummaryPanelText
                text={receiptToText(summaryData.receipt)}
                position="recipe"
              ></SummaryPanelText>
            </div>
          </div>
          <div>
            <Anchor offsetTop={50}>
              <Anchor.Link
                href="#id-paciente"
                title="1) IDENTIFICAÇÃO DO PACIENTE"
              />
              <Anchor.Link
                href="#dados-internacao"
                title="2) DADOS DA INTERNAÇÃO"
              >
                <Anchor.Link href="#admissao" title="2.1) Admissão">
                  <Anchor.Link
                    href="#motivo-admissao"
                    title="2.1.1) Motivo da Admissão"
                  />
                  <Anchor.Link
                    href="#diagnosticos"
                    title="2.1.2) Diagnósticos (primário e secundário)"
                  />
                  <Anchor.Link href="#alergias" title="2.1.3) Alergias" />
                  <Anchor.Link
                    href="#medicamentos-uso-previo"
                    title="2.1.4) Medicamentos de uso prévio"
                  />
                </Anchor.Link>

                <Anchor.Link href="#resumo-clinico" title="2.2) Resumo Clínico">
                  <Anchor.Link
                    href="#exames-lab"
                    title="2.2.1) Exames Laboratoriais"
                  />

                  <Anchor.Link
                    href="#exames-textuais"
                    title="2.2.2) Exames Textuais"
                  />

                  <Anchor.Link
                    href="#procedimentos"
                    title="2.2.3) Procedimentos Realizados"
                  />

                  <Anchor.Link
                    href="#medicamentos-internacao"
                    title="2.2.4) Medicamentos utilizados na internação"
                  />

                  <Anchor.Link
                    href="#medicamentos-interrompidos"
                    title="2.2.5) Medicamentos interrompidos"
                  />
                </Anchor.Link>

                <Anchor.Link
                  href="#condicoes-alta"
                  title="2.3) Condições de Alta"
                ></Anchor.Link>
              </Anchor.Link>

              <Anchor.Link
                href="#plano-terapeutico"
                title="3) PLANO TERAPÊUTICO"
              >
                <Anchor.Link
                  href="#plano-alta"
                  title="3.1) Plano de Alta"
                ></Anchor.Link>

                <Anchor.Link href="#receita" title="3.2) Receita"></Anchor.Link>
              </Anchor.Link>
            </Anchor>
          </div>
          <SummaryText open={modalText} setOpen={setModalText}></SummaryText>
        </SummaryContainer>
      )}
    </>
  );
}

export default Summary;
