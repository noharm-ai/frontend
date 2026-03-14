import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Space } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import Alert from "components/Alert";
import Progress from "components/Progress";
import { Checkbox, InputNumber } from "components/Inputs";
import { useAppDispatch, useAppSelector } from "store/index";
import {
  configDrugV2,
  prepareGeneration,
  generateSingle,
} from "features/outliers/ScoreWizard/ScoreWizardSlice";
import { setDrugGenerateScoreOpen } from "./DrugGenerateScoreSlice";
import { Form } from "src/styles/Form.style";

interface DrugGenerateScoreProps {
  onAfterSave?: () => void;
}

export function DrugGenerateScore({ onAfterSave }: DrugGenerateScoreProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state: any) => state.drugGenerateScore.open);
  const idDrug = useAppSelector((state: any) => state.drugGenerateScore.idDrug);
  const idSegment = useAppSelector(
    (state: any) => state.drugGenerateScore.idSegment,
  );
  const division = useAppSelector(
    (state: any) => state.drugGenerateScore.division,
  );
  const useWeight = useAppSelector(
    (state: any) => state.drugGenerateScore.useWeight,
  );
  const idMeasureUnit = useAppSelector(
    (state: any) => state.drugGenerateScore.idMeasureUnit,
  );
  const substance = useAppSelector(
    (state: any) => state.drugGenerateScore.substance,
  );
  const units = useAppSelector((state: any) => state.drugs.units.list);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [outliersStatus, setOutliersStatus] = useState("idle");
  const [progressPercentage, setProgressPercentage] = useState(0);

  const [hasDivision, setHasDivision] = useState<boolean>(
    division !== null && division !== undefined && division !== "",
  );
  const [localDivision, setLocalDivision] = useState<string | null>(division);
  const [localUseWeight, setLocalUseWeight] = useState<boolean | null>(
    useWeight,
  );
  const [formError, setFormError] = useState("");

  const onCancel = () => {
    dispatch(setDrugGenerateScoreOpen({ open: false }));
    setLoading(false);
    setOutliersStatus("idle");
    setProgressPercentage(0);
    setErrorMessage("");
    setHasDivision(
      division !== null && division !== undefined && division !== "",
    );
    setLocalDivision(division);
    setLocalUseWeight(useWeight);
    setFormError("");
  };

  const generateOutliers = async () => {
    if (localUseWeight && !localDivision) {
      setFormError(
        "O Divisor de faixas é obrigatório quando Usar peso está ativado.",
      );
      return;
    }
    setFormError("");
    setLoading(true);
    setOutliersStatus("loading");

    const payload = {
      idSegment,
      idDrug,
      division: hasDivision ? localDivision : null,
      useWeight: hasDivision ? localUseWeight : null,
      idMeasureUnit,
      measureUnitList: units,
    };

    const steps = [configDrugV2, prepareGeneration, generateSingle];
    const progressStep = 100 / steps.length;
    let progressTotal = 0;
    let error = false;

    for (let i = 0; i < steps.length; i++) {
      // @ts-expect-error ts 2554 (legacy code)
      const response = await dispatch(steps[i](payload));

      if ((response.payload as any)?.status !== "success") {
        setErrorMessage(getErrorMessage(response, t));
        error = true;
        break;
      }

      progressTotal =
        i === steps.length - 1 ? 100 : progressTotal + progressStep;
      setProgressPercentage(progressTotal);
    }

    if (!error) {
      setTimeout(() => {
        setOutliersStatus("succeeded");
        setLoading(false);
        onAfterSave?.();
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
      destroyOnHidden
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
        <Form>
          <p>Confirma a geração de escores para o medicamento?</p>
          <div className="form-row" style={{ marginTop: 16 }}>
            <Checkbox
              checked={hasDivision}
              onChange={(e: any) => {
                setHasDivision(e.target.checked);
                if (!e.target.checked) {
                  setLocalDivision(null);
                  setLocalUseWeight(null);
                  setFormError("");
                }
              }}
            >
              Divisor de faixas
            </Checkbox>
          </div>

          {hasDivision && (
            <>
              <p style={{ marginTop: 12, marginBottom: 0, fontSize: "13px" }}>
                O divisor de faixas define os intervalos de dose que entrarão na
                mesma faixa. Ex.: Divisor 5 vai definir faixas de dose de "0-5",
                de "5-10", etc. Caso deva ser considerado o peso do paciente na
                faixa de doses, selecione essa opção.
              </p>
              <div className="form-row" style={{ marginTop: 12 }}>
                <label className="form-label">Divisor</label>
                <div>
                  <Space.Compact>
                    <InputNumber
                      value={localDivision ? Number(localDivision) : null}
                      onChange={(value: number | null) =>
                        setLocalDivision(value != null ? String(value) : null)
                      }
                      min={0}
                      status={formError && !localDivision ? "error" : undefined}
                      style={{ width: "100%" }}
                    />
                    <Space.Addon>
                      {substance?.idMeasureUnit || "--"}
                    </Space.Addon>
                  </Space.Compact>
                </div>
                {substance?.divisionRange && (
                  <div className="form-info">
                    Sugestão: {substance?.divisionRange}{" "}
                    {substance?.idMeasureUnit
                      ? `${substance?.idMeasureUnit}/Kg`
                      : "Unidade indefinida"}
                  </div>
                )}
                {formError && !localDivision && (
                  <div className="form-error">{formError}</div>
                )}
              </div>
              <div className="form-row" style={{ marginTop: 12 }}>
                <Checkbox
                  checked={localUseWeight ?? false}
                  onChange={(e: any) => setLocalUseWeight(e.target.checked)}
                >
                  Usar peso
                </Checkbox>
              </div>
            </>
          )}
        </Form>
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
            <Heading>
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
