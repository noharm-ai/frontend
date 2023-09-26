import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import BackTop from "components/BackTop";
import notification from "components/notification";
import LoadBox from "components/LoadBox";

import { fetchMemory } from "./MemorySlice";
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
  }, []); //eslint-disable-line

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
        <div className="page-header-actions"></div>
      </PageHeader>

      <MemoryContainer>
        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Relatórios</h3>

          <Form memory={data["reports"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Serviço de Nomes</h3>

          <Form memory={data["getnameurl"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Features</h3>

          <Form memory={data["features"]} />
        </div>

        <div className="box">
          <div className={`loader ${loading ? "loading" : ""}`}>
            <LoadBox />
          </div>
          <h3>Relatórios do Paciente</h3>

          <Form memory={data["admission-reports"]} />
        </div>
      </MemoryContainer>

      <BackTop />
    </>
  );
}

export default Memory;
