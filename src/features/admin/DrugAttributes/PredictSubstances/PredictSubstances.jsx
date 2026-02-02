import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Progress, Alert } from "antd";

import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { predictSubstance } from "../DrugAttributesSlice";
import useQueueProcess from "src/hooks/useQueueProcess";

function PredictSubstances({ open, setOpen, reload }) {
  const { t } = useTranslation();

  const {
    loading,
    result: predictResult,
    startProcess,
    resetState,
  } = useQueueProcess({
    initialAction: predictSubstance,
    onSuccess: (result) => {
      console.log("Prediction completed successfully:", result);
      if (reload) {
        reload();
      }
    },
    onError: (error) => {
      console.error("Prediction failed:", error);
    },
  });

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const onCancel = () => {
    setOpen(false);
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
      onOk={() => startProcess()}
      okText={"Iniciar"}
      cancelText={predictResult ? t("actions.close") : t("actions.cancel")}
      confirmLoading={loading}
      okButtonProps={{
        loading,
        disabled: !!predictResult,
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
      {predictResult ? (
        <>
          {predictResult.error ? (
            <Alert
              message="Erro"
              description={
                "Ocorreu um erro inesperado ao inferir as substâncias. Entre em contato."
              }
              type="error"
              showIcon
            />
          ) : (
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
                  percent={100}
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
                <Heading $size="16px">Finalizado com sucesso</Heading>
              </div>
              <ul style={{ marginBottom: "30px" }}>
                <li>
                  Medicamentos sem substância definida: {predictResult.all}
                </li>
                <li>
                  Inferidos: {predictResult.inferred} ({predictResult.confirmed}{" "}
                  confirmados)
                </li>
                <li>Não foi possível inferir: {predictResult.skipped}</li>
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <p>
            Este processo infere as substâncias dos medicamentos que ainda não
            possuem uma substância relacionada.
          </p>
        </>
      )}
    </DefaultModal>
  );
}

export default PredictSubstances;
