import React, { useState, useEffect } from "react";
import { Row, Col, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { toDataSource } from "utils";
import Table from "components/Table";
import Empty from "components/Empty";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import Steps from "components/Steps";
import { InputNumber, Select } from "components/Inputs";
import PopConfirm from "components/PopConfirm";
import Button from "components/Button";
import DrugMeasureUnitsForm from "features/drugs/DrugMeasureUnits/DrugMeasureUnitsForm";

import unitConversionColumns from "../UnitConversion/columns";
import { StepContent, StepBtnContainer } from "./index.style";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export default function ScoreWizard({
  generateOutlier,
  selecteds,
  drugData,
  drugUnits,
  updateDrugData,
  generateStatus,
  saveUnitCoefficient,
  security,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [editDrugMeasureUnits, setEditDrugMeasureUnits] = useState(false);
  const { t } = useTranslation();
  const isAdmin = security.isAdmin();
  const maxSteps = 3;

  useEffect(() => {
    if (generateStatus.generated) {
      setCurrentStep(0);
    }
  }, [generateStatus]);

  const generate = () => {
    generateOutlier({
      idSegment: selecteds.idSegment,
      idDrug: selecteds.idDrug,
      division: drugData.division,
      useWeight: drugData.useWeight,
      idMeasureUnit: drugData.idMeasureUnit,
      measureUnitList: drugUnits.list,
    });
  };

  const nextStep = () => {
    if (isValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onChangeUseWeight = ({ target }) => {
    const useWeight = !target.value;

    if (!useWeight) {
      updateDrugData({ useWeight: useWeight, division: null, touched: true });
    } else {
      updateDrugData({ useWeight: useWeight, touched: true });
    }
  };

  const isValid = (step) => {
    if (step === 1) {
      if (drugData.useWeight && !drugData.division) {
        setValidationErrors({
          division: "Este campo é obrigatório quando o peso for considerado",
        });

        return false;
      }
    }

    setValidationErrors({});
    return true;
  };

  const unitsDatasource = toDataSource(drugUnits.list, "idMeasureUnit", {
    saveUnitCoefficient,
    idDrug: selecteds.idDrug,
    idSegment: selecteds.idSegment,
    isAdmin,
    updateDrugData,
    defaultIdMeasureUnit: drugData.idMeasureUnit,
  });

  const onDefaultMeasureUnitChange = (value) => {
    updateDrugData({ idMeasureUnit: value, touched: true });
    saveUnitCoefficient(value, { fator: 1 });
  };

  const getMeasureUnit = (id, list) => {
    const mu = list.find((i) => i.idMeasureUnit === id);
    if (mu) {
      return mu.description;
    }

    return "";
  };

  return (
    <>
      <Steps current={currentStep}>
        <Steps.Step key={0} title="Conversão de unidades" />
        <Steps.Step key={1} title="Divisor de faixas" />
        <Steps.Step key={2} title="Gerar escores" />
      </Steps>

      {currentStep === 0 && (
        <StepContent>
          <p>
            Neste passo você pode alterar a unidade padrão deste medicamento e
            os fatores de conversão para outras unidades. Lembre-se que a
            unidade padrão é definida pelo fator de conversão igual a 1.
          </p>

          <Row
            gutter={24}
            align="middle"
            type="flex"
            style={{ marginTop: "20px", marginBottom: "20px" }}
          >
            <>
              <Col md={5} xxl={3}>
                <Heading as="label" size="14px" textAlign="right">
                  Unidade padrão:
                </Heading>
              </Col>
              <Col md={24 - 5} xxl={24 - 3}>
                <Select
                  placeholder="Selecione a unidade de medida padrão para este medicamento"
                  value={drugData.idMeasureUnit}
                  style={{ minWidth: "300px" }}
                  onChange={(value) => onDefaultMeasureUnitChange(value)}
                  disabled={!drugUnits.list.length}
                >
                  {drugUnits.list.map((unit) => (
                    <Select.Option
                      value={unit.idMeasureUnit}
                      key={unit.idMeasureUnit}
                    >
                      {unit.description}
                    </Select.Option>
                  ))}
                </Select>
                {(isAdmin || security.isTraining()) && (
                  <Tooltip title={t("titles.addDrugMeasureUnit")}>
                    <Button
                      type="primary"
                      onClick={() => setEditDrugMeasureUnits(true)}
                      icon={<PlusOutlined />}
                      style={{ marginLeft: "5px" }}
                    ></Button>
                  </Tooltip>
                )}
              </Col>
            </>
          </Row>

          <DrugMeasureUnitsForm
            visible={editDrugMeasureUnits}
            setVisible={setEditDrugMeasureUnits}
          />

          <Table
            columns={unitConversionColumns}
            pagination={false}
            loading={drugUnits.isFetching}
            locale={{ emptyText }}
            dataSource={!drugUnits.isFetching ? unitsDatasource : []}
          />
        </StepContent>
      )}

      {currentStep === 1 && (
        <StepContent>
          <p>
            O divisor de faixas define os intervalos de dose que entrarão na
            mesma faixa. Ex.: Divisor 5 vai definir faixas de dose de "0-5", de
            "5-10", etc. Caso deva ser considerado o peso do paciente na faixa
            de doses, selecione essa opção.
          </p>
          <Row gutter={24} align="middle" type="flex">
            <Col md={5} xxl={3}>
              <Heading as="label" size="14px" textAlign="right">
                <Tooltip title="">Divisor de faixas:</Tooltip>
              </Heading>
            </Col>
            <Col md={24 - 5} xxl={24 - 3}>
              <InputNumber
                style={{
                  width: 120,
                  marginRight: "10px",
                }}
                min={0}
                max={99999}
                value={drugData.division}
                onChange={(value) =>
                  updateDrugData({ division: value, touched: true })
                }
                className={validationErrors.division ? "error" : ""}
              />
              <span
                style={{
                  marginRight: "10px",
                }}
              >
                {getMeasureUnit(drugData.idMeasureUnit, drugUnits.list)}
              </span>
              <Checkbox
                value={drugData.useWeight}
                checked={drugData.useWeight}
                onChange={onChangeUseWeight}
              >
                <Tooltip title="Somente será considerado peso se houver Divisor de Faixas atribuído">
                  Considerar peso
                </Tooltip>
              </Checkbox>
              {validationErrors.division && (
                <div className="error-description">
                  {validationErrors.division}
                </div>
              )}
            </Col>
          </Row>
        </StepContent>
      )}

      {currentStep === 2 && (
        <StepContent>
          <>
            {drugData.touched && (
              <p>
                Ok! Para salvar estas alterações você deve clicar no botão
                "Gerar escores".
                <br />
                Lembre-se que esta ação <strong>excluirá</strong> os escores
                manuais e os comentários. Será necessário reinseri-los
                manualmente.
              </p>
            )}
            {!drugData.touched && (
              <p>
                Nenhuma informação foi alterada, portanto você não poderá gerar
                scores.
              </p>
            )}
          </>
        </StepContent>
      )}

      <StepBtnContainer>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={() => previousStep()}>
            Voltar
          </Button>
        )}
        {currentStep < maxSteps - 1 && (
          <Button type="primary" onClick={() => nextStep()}>
            Avançar
          </Button>
        )}
        {currentStep === maxSteps - 1 && drugData.touched && (
          <PopConfirm
            title="Confirma a geração de escores?"
            onConfirm={generate}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="primary gtm-bt-med-generate"
              loading={generateStatus.isGenerating}
            >
              Gerar escores
            </Button>
          </PopConfirm>
        )}
      </StepBtnContainer>
    </>
  );
}
