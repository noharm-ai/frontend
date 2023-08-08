import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Anchor } from "antd";

import notification from "components/notification";
import LoadBox, { LoadContainer } from "components/LoadBox";

import SummaryPanelAI from "./SummaryPanelAI/SummaryPanelAI";
import SummaryPanelPatient from "./SummaryPanel/SummayPanelPatient";
import SummaryPanelAdmission from "./SummaryPanel/SummayPanelAdmission";
import SummaryPanelAttributes from "./SummaryPanel/SummayPanelPatientAttributes";
import SummaryPanelText from "./SummaryPanel/SummaryPanelText";
import { PageHeader } from "styles/PageHeader.style";
import { SummaryContainer } from "./Summary.style";
import { fetchSummary } from "./SummarySlice";
import {
  examsToText,
  allergiesToText,
  listToText,
  receiptToText,
  blocksToText,
} from "./verbalizers";

function Summary() {
  const params = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const summaryData = useSelector((state) => state.summary.data);
  const summaryBlocks = useSelector((state) => state.summary.blocks);
  const status = useSelector((state) => state.summary.status);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSummary(params.admissionNumber));
    }
  }, [status, dispatch, params.admissionNumber]);

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
                position={0}
                patient={summaryData.patient}
              ></SummaryPanelPatient>
            </div>

            <h2 id="dados-internacao">2) Dados da Internação</h2>

            <div className="sub_level">
              <SummaryPanelAdmission
                position={1}
                patient={summaryData.patient}
              ></SummaryPanelAdmission>

              <h3 id="admissao">2.1) Admissão</h3>

              <div className="sub_level">
                <h4 id="motivo-admissao">2.1.1) Motivo da Admissão</h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.reason}
                  position={2}
                />

                <h4 id="diagnosticos">
                  2.1.2) Diagnósticos (primário e secundário)
                </h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.diagnosis}
                  position={3}
                />

                <h4 id="alergias">2.1.3) Alergias</h4>
                <SummaryPanelText
                  text={allergiesToText(summaryData.allergies)}
                  position={4}
                ></SummaryPanelText>

                <h4 id="medicamentos-uso-previo">
                  2.1.4) Medicamentos de uso prévio
                </h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.previousDrugs}
                  position={5}
                />
              </div>

              <h3 id="resumo-clinico">2.2) Resumo Clínico</h3>

              <div className="sub_level">
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.clinicalSummary}
                  position={6}
                />

                <h4 id="exames-complementares">2.2.1) Exames complementares</h4>

                <SummaryPanelText
                  text={examsToText(summaryData.exams)}
                  position={7}
                ></SummaryPanelText>

                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.exams}
                  position={8}
                />

                <h4 id="procedimentos">2.2.2) Procedimentos realizados</h4>
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.procedures}
                  position={9}
                />

                <h4 id="medicamentos-internacao">
                  2.2.3) Medicamentos utilizados na internação
                </h4>
                <SummaryPanelText
                  text={listToText(summaryData.drugsUsed, "name")}
                  position={10}
                ></SummaryPanelText>

                <h4 id="medicamentos-interrompidos">
                  2.2.4) Medicamentos interrompidos
                </h4>
                <SummaryPanelText
                  text={listToText(summaryData.drugsSuspended, "name")}
                  position={11}
                ></SummaryPanelText>
              </div>

              <h3 id="condicoes-alta">2.3) Condição de Alta</h3>

              <div className="sub_level">
                <SummaryPanelAI
                  url={summaryData.summaryConfig?.url}
                  apikey={summaryData.summaryConfig?.apikey}
                  payload={summaryData.summaryConfig?.dischargeCondition}
                  position={12}
                />

                <SummaryPanelAttributes
                  position={13}
                  patient={summaryData.patient}
                ></SummaryPanelAttributes>
              </div>
            </div>

            <h2 id="plano-terapeutico">3) Plano Terapêutico</h2>

            <div className="sub_level">
              <h3 id="receita">3.1) Receita</h3>
              <SummaryPanelText
                text={receiptToText(summaryData.receipt)}
                position={14}
              ></SummaryPanelText>

              <h3 id="plano-alta">3.2) Plano de Alta</h3>

              <SummaryPanelAI
                url={summaryData.summaryConfig?.url}
                apikey={summaryData.summaryConfig?.apikey}
                payload={summaryData.summaryConfig?.dischargePlan}
                position={15}
              />
            </div>

            <textarea
              style={{ width: "100%", height: "500px" }}
              value={blocksToText(summaryBlocks)}
            ></textarea>
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
                    href="#exames-complementares"
                    title="2.2.1) Exames Complementares"
                  />

                  <Anchor.Link
                    href="#procedimentos"
                    title="2.2.2) Procedimentos Realizados"
                  />

                  <Anchor.Link
                    href="#medicamentos-internacao"
                    title="2.2.3) Medicamentos utilizados na internação"
                  />

                  <Anchor.Link
                    href="#medicamentos-interrompidos"
                    title="2.2.4) Medicamentos interrompidos"
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
                <Anchor.Link href="#receita" title="3.1) Receita"></Anchor.Link>

                <Anchor.Link
                  href="#plano-alta"
                  title="3.2) Plano de Alta"
                ></Anchor.Link>
              </Anchor.Link>
            </Anchor>
          </div>
        </SummaryContainer>
      )}
    </>
  );
}

export default Summary;
