import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import Alert from "components/Alert";
import Progress from "components/Progress";
import { fetchReferencesListThunk } from "store/ducks/outliers/thunk";
import { fetchDrugsUnitsListThunk } from "store/ducks/drugs/thunk";

import {
  prepareGeneration,
  generateSingle,
  configDrug,
} from "../ScoreWizardSlice";

function GenerateScore({ open, setOpen, setCurrentStep }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDrug = useSelector((state) => state.outliers.firstFilter);
  const drugData = useSelector((state) => state.outliers.drugData);
  const units = useSelector((state) => state.drugs.units.list);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [outliersStatus, setOutliersStatus] = useState("idle");
  const [progressPercentage, setProgressPercentage] = useState("idle");

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setOutliersStatus("idle");
      setProgressPercentage(0);
      setErrorMessage("");
    }
  }, [open]);

  const onCancel = () => {
    setOpen(false);
  };

  const generateOutliers = async () => {
    setLoading(true);
    setOutliersStatus("loading");

    const payload = {
      idSegment: currentDrug.idSegment,
      idDrug: currentDrug.idDrug,
      division: drugData.division,
      useWeight: drugData.useWeight,
      idMeasureUnit: drugData.idMeasureUnit,
      measureUnitList: units,
    };

    const data = [configDrug, prepareGeneration, generateSingle];
    const progressStep = 100 / data.length;
    let progressTotal = 0;
    let error = false;
    for (let i = 0; i < data.length; i++) {
      const response = await dispatch(data[i](payload));

      if (response.payload?.status !== "success") {
        setErrorMessage(getErrorMessage(response, t));
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

        dispatch(
          fetchReferencesListThunk(currentDrug.idSegment, currentDrug.idDrug)
        );

        dispatch(
          fetchDrugsUnitsListThunk({
            id: currentDrug.idDrug,
            idSegment: currentDrug.idSegment,
          })
        );

        setCurrentStep(0);
      }, 1000);
    } else {
      setOutliersStatus("error");
      notification.error({
        message: "Ocorreu um erro ao gerar os escores.",
        description: errorMessage,
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
      onOk={generateOutliers}
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
          <p>Confirma a geração de escores para o medicamento?</p>
        </>
      )}

      {outliersStatus === "error" && (
        <Alert
          message="Ocorreu um erro ao gerar os escores."
          description={errorMessage}
          type="error"
          showIcon
        />
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
          </div>
        </>
      )}
    </DefaultModal>
  );
}

export default GenerateScore;
