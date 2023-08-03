import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import notification from "components/notification";
import LoadBox, { LoadContainer } from "components/LoadBox";

import SummaryPanelAI from "./SummaryPanelAI/SummaryPanelAI";
import SummaryPanelPatient from "./SummaryPanel/SummayPanelPatient";
import SummaryPanelAdmission from "./SummaryPanel/SummayPanelAdmission";
import { PageHeader } from "styles/PageHeader.style";
import { SummaryPanel, SummaryHeader, SummaryContainer } from "./Summary.style";
import { fetchSummary } from "./SummarySlice";

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

  const blocksToText = () => {
    return `1) Identificação do Paciente
${summaryBlocks[0]}

2) Dados da Internação
${summaryBlocks[1]}

2.1) Admissão

2.1.1) Motivo
${summaryBlocks[2]}
`;
  };

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
          <SummaryHeader>1) Identificação do Paciente</SummaryHeader>
          <SummaryPanelPatient
            position={0}
            patient={summaryData.patient}
          ></SummaryPanelPatient>

          <SummaryHeader>2) Dados da Internação</SummaryHeader>
          <SummaryPanelAdmission
            position={1}
            patient={summaryData.patient}
          ></SummaryPanelAdmission>

          <SummaryHeader>2.1) Admissão</SummaryHeader>
          <SummaryPanelAI
            url={summaryData.summaryConfig?.url}
            apikey={summaryData.summaryConfig?.apikey}
            payload={summaryData.summaryConfig?.reason}
            position={2}
          />

          <SummaryPanel className="loading">
            Carregando Diagnósticos/Comorbidades/Fatores de riscos...
          </SummaryPanel>

          <SummaryPanel>Alergias</SummaryPanel>

          <SummaryPanelAI
            url={summaryData.summaryConfig?.url}
            apikey={summaryData.summaryConfig?.apikey}
            payload={summaryData.summaryConfig?.previousDrugs}
            introduction="Medicamentos de uso prévio:"
            position={5}
          />

          <SummaryHeader>2.2) Resumo Clínico</SummaryHeader>
          <SummaryPanel className="loading">Resumindo...</SummaryPanel>

          <SummaryPanel className="loading">
            Exames complementares...
          </SummaryPanel>

          <SummaryPanel className="loading">
            Procedimentos realizados...
          </SummaryPanel>

          <SummaryPanel className="loading">
            Medicamentos utilizados na internação...
          </SummaryPanel>

          <SummaryPanel className="loading">
            Medicamentos interrompidos...
          </SummaryPanel>

          <SummaryHeader>2.3) Condição de Alta</SummaryHeader>
          <SummaryPanel className="loading">Resumindo...</SummaryPanel>

          <SummaryPanel>
            <div className="group">
              <div className="attribute">
                <label>Peso:</label> <span>70Kg</span>
              </div>

              <div className="attribute">
                <label>Altura:</label> <span>170cm</span>
              </div>

              <div className="attribute">
                <label>IMC:</label> <span>24,22</span>
              </div>
            </div>
          </SummaryPanel>

          <SummaryHeader>3) Plano Terapêutico</SummaryHeader>
          <SummaryPanel className="loading">Resumindo...</SummaryPanel>

          <SummaryPanel>Receita</SummaryPanel>

          <SummaryPanel>Exames pendentes...</SummaryPanel>

          <SummaryPanel className="loading">Orientações...</SummaryPanel>

          <SummaryPanel className="loading">Encaminhamentos...</SummaryPanel>

          <SummaryPanel className="loading">
            Retorno/Orientações de intercorrência
          </SummaryPanel>

          <textarea
            style={{ width: "100%", height: "500px" }}
            value={blocksToText()}
          ></textarea>
        </SummaryContainer>
      )}
    </>
  );
}

export default Summary;
