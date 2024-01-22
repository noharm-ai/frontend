import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import Alert from "components/Alert";
import Progress from "components/Progress";

import {
  setSegment,
  getOutlierProcessList,
  generateOutlierFold,
} from "../SegmentSlice";

function OutliersForm({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const segment = useSelector((state) => state.admin.segment.single.data);
  const [loading, setLoading] = useState(false);
  const [outliersStatus, setOutliersStatus] = useState("idle");
  const [outliersErrorMessage, setOutliersErrorMessage] = useState("idle");
  const [progressPercentage, setProgressPercentage] = useState("idle");
  const [refreshWarning, setRefreshWarning] = useState(null);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setOutliersStatus("idle");
      setProgressPercentage(0);
      setRefreshWarning(null);
      setOutliersErrorMessage(null);
    }
  }, [open]);

  const onCancel = () => {
    dispatch(setSegment(null));
    setOpen(false);
  };

  const startProcess = () => {
    setLoading(true);
    dispatch(getOutlierProcessList({ idSegment: segment.id })).then(
      (response) => {
        if (response.error) {
          setLoading(false);
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          notification.info({
            message: "Iniciando a geração de escores",
            description: "Este processo pode demorar alguns minutos",
          });

          if (
            !response.payload.data.data[0]?.url?.includes(
              "integration/refresh-agg"
            )
          ) {
            setRefreshWarning(true);
          }

          if (response.payload.data.data.length <= 1) {
            setOutliersErrorMessage(
              "Não há histórico de prescrição para este segmento."
            );
            setLoading(false);
          } else {
            generateOutliers(response.payload.data.data);
          }
        }
      }
    );
  };

  const generateOutliers = async (data) => {
    setOutliersStatus("loading");

    const progressStep = 100 / data.length;
    let progressTotal = 0;
    let error = false;

    for (let i = 0; i < data.length; i++) {
      const url = data[i].url;

      const response = await dispatch(
        generateOutlierFold({
          url,
          method: data[i].method,
          params: data[i].params,
        })
      );

      if (response.payload?.data?.status !== "success") {
        error = true;
        break;
      }

      if (i === data.length - 1) {
        progressTotal = 100;
      } else {
        progressTotal += progressStep;
      }

      setProgressPercentage(progressTotal);
    }

    if (!error) {
      setTimeout(() => {
        setOutliersStatus("succeeded");
        setLoading(false);
      }, 1000);
    } else {
      setOutliersStatus("error");
      notification.error({
        message: "Ocorreu um erro inesperado ao gerar os escores.",
      });
      setLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <DefaultModal
      open={open}
      width={500}
      centered
      destroyOnClose
      onCancel={onCancel}
      onOk={startProcess}
      okText={"Gerar Escores"}
      cancelText={
        outliersStatus === "succeeded"
          ? t("actions.close")
          : t("actions.cancel")
      }
      confirmLoading={loading}
      okButtonProps={{
        loading,
        disabled: outliersStatus === "succeeded",
      }}
      cancelButtonProps={{
        loading,
      }}
      maskClosable={false}
      closable={false}
    >
      <header>
        <Heading style={{ fontSize: "20px" }}>Gerar Escores</Heading>
      </header>
      {outliersStatus === "idle" && (
        <>
          <p>
            Confirma a geração de escores para o segmento{" "}
            <strong>{segment.description}</strong> ?
          </p>
          <p>Observações:</p>
          <ul style={{ marginBottom: "30px" }}>
            <li>
              Esta ação recalcula a tabela prescricaoagg quando possui menos de
              500mil registros.
            </li>
            <li>Os escores manuais serão removidos</li>
          </ul>
        </>
      )}

      {(outliersStatus === "error" || outliersErrorMessage) && (
        <>
          <Alert
            message="Erro"
            description={
              outliersErrorMessage ||
              "Ocorreu um erro inesperado ao gerar os escores. Consulte os logs."
            }
            type="error"
            showIcon
          />
          {refreshWarning && (
            <Alert
              description="Não foi possível recalcular o histórico de prescrição devido ao volume de dados. Gerar os escores sem antes recalcular o histórico pode causar erros. Favor solicitar o cálculo manual antes de gerar os escores."
              type="warning"
              showIcon
            />
          )}
        </>
      )}

      {(outliersStatus === "loading" || outliersStatus === "succeeded") && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Progress
              type="circle"
              percent={Math.round(progressPercentage)}
              strokeColor={{
                "0%": "rgb(112, 189, 196)",
                "100%": "rgb(126, 190, 154)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "15px",
              marginBottom: "20px",
            }}
          >
            <Heading size="16px">
              {outliersStatus === "loading"
                ? "Gerando escores..."
                : "Escores gerados com sucesso"}
            </Heading>
            <p style={{ marginTop: "5px" }}>{segment.description}</p>
            {refreshWarning && (
              <Alert
                description="Não foi possível recalcular o histórico de prescrição devido ao volume de dados. Gerar os escores sem antes recalcular o histórico pode causar erros. Favor solicitar o cálculo manual antes de gerar os escores."
                type="warning"
                showIcon
              />
            )}
          </div>
        </>
      )}
    </DefaultModal>
  );
}

export default OutliersForm;
