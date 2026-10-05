import { useState } from "react";
import { Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";

import Button from "src/components/Button";
import Modal from "src/components/Modal";
import { LoadPlan, LoadResult } from "../patientNames/loadPatientNames";
import {
  ReportNames,
  usePatientNamesLoad,
} from "../patientNames/usePatientNamesLoad";
import { NamesLoadProgress } from "../NamesLoadProgress/NamesLoadProgress";

interface LoadPatientNamesProps {
  names: ReportNames;
}

type Status = "idle" | "running" | "finished" | "error";

const EMPTY_PLAN: LoadPlan = {
  total: 0,
  loaded: 0,
  missing: 0,
  cached: 0,
  pending: 0,
};

/**
 * The only way to load the report's patient names: a button and a modal
 * with progress. A new run asks only for the patients still unanswered.
 */
export function LoadPatientNames({ names }: LoadPatientNamesProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<LoadPlan>(EMPTY_PLAN);
  const [summary, setSummary] = useState<LoadResult | null>(null);
  const load = usePatientNamesLoad(names, "button");

  const loadedCount = Object.keys(names.known).length;
  const nothingToLoad = plan.cached === 0 && plan.pending === 0;

  const openModal = () => {
    setPlan(load.plan());
    setStatus("idle");
    setSummary(null);
    setOpen(true);
  };

  const run = async () => {
    setStatus("running");
    const result = await load.run();
    if (!result) return;

    setSummary(result);
    setStatus(result.complete || result.cancelled ? "finished" : "error");
  };

  const close = () => {
    if (status === "running") return;
    setOpen(false);
  };

  const footer = (() => {
    if (status === "idle") {
      return [
        <Button key="cancel" onClick={close}>
          {nothingToLoad ? "Fechar" : "Cancelar"}
        </Button>,
        ...(nothingToLoad
          ? []
          : [
              <Button key="load" type="primary" onClick={run}>
                Carregar
              </Button>,
            ]),
      ];
    }

    if (status === "running") {
      return [
        <Button key="stop" danger onClick={load.cancel}>
          Cancelar
        </Button>,
      ];
    }

    return [
      <Button key="close" type="primary" onClick={close}>
        Fechar
      </Button>,
    ];
  })();

  return (
    <>
      <Button
        icon={<UserOutlined />}
        onClick={openModal}
        data-kb="reports.file.patientNames"
      >
        {loadedCount > 0
          ? `Nomes carregados (${loadedCount}/${names.ids.length})`
          : "Carregar nomes"}
      </Button>

      <Modal
        title="Nomes dos pacientes"
        open={open}
        onCancel={close}
        closable={status !== "running"}
        maskClosable={false}
        keyboard={status !== "running"}
        destroyOnHidden
        footer={footer}
        width={500}
      >
        <div data-kb="reports.file.patientNamesModal">
          {status === "idle" && (
            <>
              <p>
                Este relatório possui <strong>{plan.total}</strong> pacientes
                distintos.
              </p>
              {nothingToLoad ? (
                <p>Todos os nomes deste relatório já foram consultados.</p>
              ) : (
                <ul>
                  {plan.loaded > 0 && (
                    <li>{plan.loaded} nomes já carregados nesta tela.</li>
                  )}
                  {plan.missing > 0 && (
                    <li>{plan.missing} pacientes já consultados sem nome.</li>
                  )}
                  <li>{plan.cached} nomes já disponíveis no cache local.</li>
                  <li>
                    {plan.pending} nomes serão buscados no serviço de nomes.
                  </li>
                </ul>
              )}
              <Alert
                type="info"
                showIcon
                description="Os nomes ficam apenas nesta tela: não são gravados no cache de nomes. Para tê-los num arquivo, escolha exportar com nomes."
              />
            </>
          )}

          {status === "running" && (
            <NamesLoadProgress
              current={load.progress.current}
              total={load.progress.total}
            />
          )}

          {(status === "finished" || status === "error") && summary && (
            <>
              <ul>
                <li>
                  Carregados: {summary.cached + summary.fetched} (cache:{" "}
                  {summary.cached}, buscados: {summary.fetched})
                </li>
                <li>Não encontrados: {summary.notFound.length}</li>
                {summary.failed > 0 && (
                  <li>Falha na busca: {summary.failed}</li>
                )}
                {summary.remaining > 0 && (
                  <li>Não consultados: {summary.remaining}</li>
                )}
              </ul>

              {status === "finished" && summary.cancelled && (
                <Alert
                  type="warning"
                  showIcon
                  message="Carregamento cancelado. Os nomes já obtidos foram aplicados."
                />
              )}

              {status === "error" && (
                <Alert
                  type="error"
                  showIcon
                  message="Não foi possível buscar todos os nomes."
                  description='Os nomes obtidos até aqui foram aplicados. Clique em "Nomes carregados" novamente para buscar os restantes.'
                />
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
