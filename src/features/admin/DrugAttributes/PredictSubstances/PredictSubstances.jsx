import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import Alert from "components/Alert";
import Progress from "components/Progress";

import {
  getDrugsMissingSubstance,
  predictSubstance,
} from "../DrugAttributesSlice";

function PredictSubstances({ open, setOpen, reload }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [predictStatus, setPredictStatus] = useState("idle");
  const [predictErrorMessage, setPredictErrorMessage] = useState("idle");
  const [progressPercentage, setProgressPercentage] = useState("idle");
  const [affectedItems, setAffectedItems] = useState(null);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setPredictStatus("idle");
      setProgressPercentage(0);
      setPredictErrorMessage(null);
      setAffectedItems(null);
    } else {
      dispatch(getDrugsMissingSubstance()).then((response) => {
        if (!response.error) {
          setAffectedItems(response.payload.data.data.length);
        }
      });
    }
  }, [open, dispatch]);

  const onCancel = () => {
    setOpen(false);
  };

  const startProcess = () => {
    setLoading(true);
    dispatch(getDrugsMissingSubstance()).then((response) => {
      if (response.error) {
        setLoading(false);
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.info({
          message: "Iniciando a predição de substâncias",
          description: "Este processo pode demorar alguns minutos",
        });

        if (response.payload.data.data.length === 0) {
          setPredictErrorMessage(
            "Não foram encontrados medicamentos sem substância relacionada"
          );
          setLoading(false);
        } else {
          predictSubstances(response.payload.data.data);
        }
      }
    });
  };

  const predictSubstances = async (data) => {
    setPredictStatus("loading");

    const limit = 100;
    const steps = Math.ceil(data.length / limit);

    const progressStep = 100 / steps;
    let progressTotal = 0;
    let error = false;

    for (let i = 0; i < steps; i++) {
      const offset = i * limit;
      const slice = data.slice(offset, offset + limit);

      const response = await dispatch(
        predictSubstance({
          idDrugs: slice,
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
        setPredictStatus("succeeded");
        setAffectedItems(data.length);
        setLoading(false);
        if (reload) {
          reload();
        }
      }, 1000);
    } else {
      setPredictStatus("error");
      notification.error({
        message: "Ocorreu um erro inesperado ao inferir as substâncias.",
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
      okText={"Iniciar"}
      cancelText={
        predictStatus === "succeeded" ? t("actions.close") : t("actions.cancel")
      }
      confirmLoading={loading}
      okButtonProps={{
        loading,
        disabled: predictStatus === "succeeded",
      }}
      cancelButtonProps={{
        loading,
      }}
      maskClosable={false}
      closable={false}
    >
      <header>
        <Heading style={{ fontSize: "20px" }}>Inferir Substâncias</Heading>
      </header>
      {predictStatus === "idle" && (
        <>
          <p>
            Este processo infere as substâncias dos medicamentos que ainda não
            possuem uma substância relacionada.
          </p>
          {affectedItems !== null && (
            <>
              <p>Observações:</p>
              <ul style={{ marginBottom: "30px" }}>
                <li>{affectedItems} medicamentos serão atualizados.</li>
              </ul>
            </>
          )}
        </>
      )}

      {(predictStatus === "error" || predictErrorMessage) && (
        <>
          <Alert
            message="Erro"
            description={
              predictErrorMessage ||
              "Ocorreu um erro inesperado ao inferir as substâncias. Consulte os logs."
            }
            type="error"
            showIcon
          />
        </>
      )}

      {(predictStatus === "loading" || predictStatus === "succeeded") && (
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
              {predictStatus === "loading"
                ? "Inferindo..."
                : "Finalizado com sucesso"}
            </Heading>
            {affectedItems !== null && predictStatus === "succeeded" && (
              <Heading size="14px">
                {affectedItems} medicamentos atualizados
              </Heading>
            )}
          </div>
        </>
      )}
    </DefaultModal>
  );
}

export default PredictSubstances;
