import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import notification from "components/notification";
import LoadBox, { LoadContainer } from "components/LoadBox";

import SummaryPanelAI from "./SummaryPanelAI/SummaryPanelAI";
import { PageHeader } from "styles/PageHeader.style";
import { SummaryPanel, SummaryHeader, SummaryContainer } from "./Summary.style";
import { fetchSummary } from "./SummarySlice";

function Summary() {
  const params = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const summaryData = useSelector((state) => state.summary.data);
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
          <SummaryHeader>1) Identificação do Paciente</SummaryHeader>
          <SummaryPanel>
            <div className="attribute">
              <label>Nome do Paciente:</label> <span>Paciente1</span>
            </div>

            <div className="group">
              <div className="attribute">
                <label>Data de Nascimento:</label> 01/01/2023
              </div>

              <div className="attribute">
                <label>Sexo:</label> Masculino
              </div>
            </div>

            <div className="attribute">
              <label>Cor:</label>
              <span>Não informado</span>
            </div>

            <div className="group">
              <div className="attribute">
                <label>Ocupação:</label> <span>Não informado</span>
              </div>

              <div className="attribute">
                <label>Estado Civil:</label> <span>Não informado</span>
              </div>
            </div>
          </SummaryPanel>

          <SummaryHeader>2) Dados da Internação</SummaryHeader>
          <SummaryPanel>
            <div className="group">
              <div className="attribute">
                <label>Data da Internação:</label> 01/01/2023
              </div>

              <div className="attribute">
                <label>Data da Alta:</label> 01/01/2023
              </div>
            </div>
          </SummaryPanel>

          <SummaryHeader>2.1) Admissão</SummaryHeader>
          <SummaryPanelAI
            url={summaryData.summaryConfig?.url}
            apikey={summaryData.summaryConfig?.apikey}
            payload={summaryData.summaryConfig?.reason}
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
        </SummaryContainer>
      )}
    </>
  );
}

export default Summary;
