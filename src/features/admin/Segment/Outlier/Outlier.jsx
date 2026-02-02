import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckSquareFilled } from "@ant-design/icons";
import { Progress } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import Alert from "components/Alert";

import {
  setSegment,
  generateSegmentOutliers,
  refreshAgg,
} from "../SegmentSlice";
import { getQueueStatus } from "src/features/serverActions/ServerActionsSlice";

function OutliersForm({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const segment = useSelector((state) => state.admin.segment.single.data);
  const [loading, setLoading] = useState(false);
  const [outliersStatus, setOutliersStatus] = useState("idle");
  const [outliersErrorMessage, setOutliersErrorMessage] = useState(null);
  const [processStage, setProcessStage] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const onCancel = () => {
    dispatch(setSegment(null));
    setOpen(false);
    setLoading(false);
    setOutliersStatus("idle");
    setOutliersErrorMessage(null);
    setProcessStage([]);
    setProgressPercentage(0);
  };

  const startProcess = async () => {
    setLoading(true);
    setOutliersStatus("loading");
    setProcessStage((prev) => [
      ...prev,
      "Recalculando histórico de prescrição (até 5min de espera)",
    ]);
    setProgressPercentage(25);
    const refreshResponse = await dispatch(refreshAgg());
    if (refreshResponse.error) {
      if (refreshResponse.error) {
        setLoading(false);
        setOutliersStatus("error");
        setOutliersErrorMessage(refreshResponse.payload?.message || null);
        notification.error({
          message: getErrorMessage(refreshResponse, t),
        });
        return;
      }
    }

    console.log("Refresh response:", refreshResponse);

    const requestId = refreshResponse.payload.data.data.request_id;

    console.log("Refresh requestId:", requestId);

    const checkQueueStatus = setInterval(async () => {
      const statusResponse = await dispatch(getQueueStatus({ requestId }));
      console.log("Queue status response:", statusResponse);

      if (statusResponse.error) {
        clearInterval(checkQueueStatus);
        setOutliersStatus("error");
        setLoading(false);
        notification.error({
          message: getErrorMessage(statusResponse, t),
        });
      } else {
        const statusData = statusResponse.payload.data;

        if (statusData.found) {
          clearInterval(checkQueueStatus);

          console.log("Status data response:", statusData.response);

          if (!statusData.response.error) {
            console.log("Queue process succeeded:", statusResponse);
            setProcessStage((prev) => [
              ...prev,
              "Histórico de prescrição recalculado",
            ]);
            setProgressPercentage(50);
            generateOutliers();
          } else {
            setLoading(false);
            setOutliersStatus("error");

            console.error("queue process failed", statusData.response);
            notification.error({
              message:
                "Ocorreu um erro ao recalcular o histórico de prescrição. Favor verificar os logs.",
            });
          }
        }
      }
    }, 5000);
  };

  const generateOutliers = async () => {
    setProcessStage((prev) => [...prev, "Gerando outliers"]);

    const response = await dispatch(
      generateSegmentOutliers({ idSegment: segment.id }),
    );
    if (response.error) {
      setLoading(false);
      setOutliersStatus("error");
      setOutliersErrorMessage(response.payload?.message || null);
      notification.error({
        message: getErrorMessage(response, t),
      });
      return;
    }

    setProcessStage((prev) => [
      ...prev,
      "Outliers gerados",
      "Iniciando o cálculo dos escores",
    ]);
    setProgressPercentage(75);

    const requestId = response.payload.data.data.request_id;

    const checkQueueStatus = setInterval(async () => {
      const statusResponse = await dispatch(getQueueStatus({ requestId }));
      console.log("Queue status response:", statusResponse);

      if (statusResponse.error) {
        clearInterval(checkQueueStatus);
        setOutliersStatus("error");
        setLoading(false);
        notification.error({
          message: getErrorMessage(statusResponse, t),
        });
      } else {
        const statusData = statusResponse.payload.data;

        if (statusData.found) {
          clearInterval(checkQueueStatus);

          if (!statusData.response.error) {
            console.log("Queue process succeeded:", statusResponse);
            setProcessStage((prev) => [
              ...prev,
              "Cálculo dos escores finalizado",
            ]);
            setProgressPercentage(100);
            setOutliersStatus("succeeded");
            setLoading(false);
            notification.success({
              message: "Escores gerados com sucesso!",
            });
          } else {
            setLoading(false);
            setOutliersStatus("error");
            console.error("queue process failed", statusData.response);
            notification.error({
              message:
                "Ocorreu um erro ao gerar escores. Favor verificar os logs.",
            });
          }
        }
      }
    }, 5000);
  };

  if (!open) {
    return null;
  }

  return (
    <DefaultModal
      open={open}
      width={500}
      centered
      destroyOnHidden
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
            <Heading $size="16px">
              {outliersStatus === "loading"
                ? "Gerando escores..."
                : "Escores gerados com sucesso"}
            </Heading>
            <p style={{ marginTop: "5px" }}>{segment.description}</p>
            {loading && processStage.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                {processStage.map((stage, index) => (
                  <p
                    key={index}
                    style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}
                  >
                    <CheckSquareFilled /> {stage}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DefaultModal>
  );
}

export default OutliersForm;
