import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import BackTop from "components/BackTop";
import notification from "components/notification";
import LoadBox from "components/LoadBox";

import { fetchMemory, reset } from "./MemorySlice";
import Form from "./Form";
import { MemoryContainer } from "./Memory.style";
import { PageHeader } from "styles/PageHeader.style";

function Memory() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.admin.memory.data);
  const status = useSelector((state) => state.admin.memory.status);
  const statusSaving = useSelector((state) => state.admin.memory.single.status);
  const loading = status === "loading" || statusSaving === "loading";

  useEffect(() => {
    dispatch(fetchMemory());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (status === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">Memória</h1>
        <div className="page-header-legend">
          Configurações gerais da aplicação
        </div>
      </PageHeader>

      <MemoryContainer>
        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Relatórios</h3>
          <div className="box-legend">Lista de relatórios geral.</div>

          <Form memory={data["reports"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Relatórios do Paciente</h3>
          <div className="box-legend">
            Lista de relatórios exibidos no card do paciente.
          </div>

          <Form memory={data["admission-reports"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Serviço de Nomes</h3>
          <div className="box-legend">
            Configuração do serviço de nomes. Formato: JSON. Atributos: "value"
            e "multiple".
          </div>

          <Form memory={data["getnameurl"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Features</h3>
          <div className="box-legend">
            Array com a lista de features ativas.
          </div>

          <Form memory={data["features"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Vias: Sonda</h3>
          <div className="box-legend">
            Lista com as vias que ativam a flag SONDA.
          </div>

          <Form memory={data["map-tube"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Vias: Intravenosa</h3>
          <div className="box-legend">
            Lista com as vias que ativam a flag SONDA.
          </div>

          <Form memory={data["map-iv"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Origem: Medicamentos</h3>
          <div className="box-legend">
            Lista com as origens que mapeiam para o tipo "Medicamentos"
          </div>

          <Form memory={data["map-origin-drug"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Origem: Soluções</h3>
          <div className="box-legend">
            Lista com as origens que mapeiam para o tipo "Soluções"
          </div>

          <Form memory={data["map-origin-solution"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Origem: Procedimentos/Exames</h3>
          <div className="box-legend">
            Lista com as origens que mapeiam para o tipo "Procedimentos/Exames"
          </div>

          <Form memory={data["map-origin-procedure"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Origem: Dietas</h3>
          <div className="box-legend">
            Lista com as origens que mapeiam para o tipo "Dietas"
          </div>

          <Form memory={data["map-origin-diet"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Origem: Custom</h3>
          <div className="box-legend">
            Valores listados aqui serão aceitados como origem válida.
          </div>

          <Form memory={data["map-origin-custom"]} />
        </div>
      </MemoryContainer>

      <BackTop />
    </>
  );
}

export default Memory;
