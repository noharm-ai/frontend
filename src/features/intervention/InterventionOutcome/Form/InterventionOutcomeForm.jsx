import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { Row, Col, Space, Checkbox, Alert } from "antd";
import {
  SearchOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";
import { isEmpty } from "lodash";
import Big from "big.js";

import { InputNumber, Input, Select } from "components/Inputs";
import { formatDate } from "utils/date";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import EconomyDayCalculator from "./EconomyDayCalculator";

import {
  InterventionOutcomeContainer,
  PrescriptionOption,
} from "../InterventionOutcome.style";

const INPUT_PRECISION = 6;

export default function InterventionOutcomeForm() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const outcomeData = useSelector((state) => state.interventionOutcome.data);
  const loadStatus = useSelector((state) => state.interventionOutcome.status);
  const [details, setDetails] = useState(false);
  const costPerDayHint =
    "(Dose dispensada X Custo + Custo Kit) X Frequência/Dia";

  const onChangePrescriptionDestiny = (value) => {
    setFieldValue("idPrescriptionDrugDestiny", value);

    outcomeData.destiny.forEach((dData) => {
      if (dData.item.idPrescriptionDrug === value) {
        setFieldValue("destiny", dData.item);
      }
    });
  };

  const openPrescription = (id) => {
    window.open(`/prescricao/${id}`);
  };

  const calcEconomyDay = (formValues) => {
    if (
      outcomeData.header?.economyType === 2 &&
      formValues.origin.pricePerDose &&
      formValues.origin.frequencyDay &&
      formValues.destiny.pricePerDose &&
      formValues.destiny.frequencyDay
    ) {
      const originValue = Big(formValues.origin.pricePerDose).times(
        Big(formValues.origin.frequencyDay)
      );
      const destinyValue = Big(formValues.destiny.pricePerDose).times(
        Big(formValues.destiny.frequencyDay)
      );
      const economy = originValue.minus(destinyValue);

      return economy.toFixed(6) < 0 ? 0 : economy;
    }

    if (
      outcomeData.header?.economyType === 1 &&
      formValues.origin.pricePerDose &&
      formValues.origin.frequencyDay
    ) {
      const economy = Big(formValues.origin.pricePerDose).times(
        formValues.origin.frequencyDay
      );

      return economy.toFixed(6) < 0 ? 0 : economy;
    }

    return 0;
  };

  const pricePerDayStatus = (source) => {
    if (
      !values[source]?.conversion?.doseFactor ||
      !values[source]?.conversion?.priceFactor
    ) {
      return "error";
    }

    let original = {};
    if (source === "origin") {
      original = outcomeData.original[source];
    } else {
      original = outcomeData.original.destiny
        ? outcomeData.original.destiny.find(
            (i) =>
              i.item?.idPrescriptionDrug === values.idPrescriptionDrugDestiny
          )
        : {};
    }

    const fields = ["dose", "frequencyDay", "price", "priceKit"];

    const fieldsStatus = fields.map((f) => {
      if (!values[source][f] && f !== "priceKit") {
        return "error";
      }

      if (!Big(values[source][f]).eq(Big(original.item[f]))) {
        return "warning";
      }

      return false;
    });

    if (fieldsStatus.indexOf("error") !== -1) {
      return "error";
    }

    if (fieldsStatus.indexOf("warning") !== -1) {
      return "warning";
    }

    return "";
  };

  if (loadStatus === "loading" || isEmpty(outcomeData)) {
    return null;
  }

  if (outcomeData.header?.patient || !outcomeData.header?.economyType) {
    return <p>Confirma esta ação?</p>;
  }

  return (
    <InterventionOutcomeContainer>
      <Row gutter={24}>
        <Col
          xs={outcomeData.header?.economyType === 2 ? 12 : 24}
          style={{ paddingBottom: "10px" }}
        >
          <div className={`form-row`}>
            <div className="form-label">
              <label className="main-label">Origem:</label>
            </div>
            <div className="form-value">{outcomeData.header.originDrug}</div>
          </div>
        </Col>
        {outcomeData.header?.economyType === 2 && (
          <Col
            xs={12}
            style={{ borderLeft: "1px solid #d9d9d9", paddingBottom: "10px" }}
          >
            <div className={`form-row`}>
              <div className="form-label">
                <label className="main-label">Substituição:</label>
              </div>
              <div className="form-value">{outcomeData.header.destinyDrug}</div>
            </div>
          </Col>
        )}
      </Row>

      <Row gutter={24}>
        <Col xs={outcomeData.header?.economyType === 2 ? 12 : 24}>
          <div style={{ padding: "1rem" }}>
            {outcomeData.header?.economyType === 1 && (
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Tipo:</label>
                </div>
                <div className="form-value">Suspensão</div>
              </div>
            )}

            <div className={`form-row`}>
              <div className="form-label">
                <label>Prescrição:</label>
              </div>
              <div className="form-input">
                <Space direction="horizontal">
                  <Input
                    value={`${formatDate(
                      outcomeData.origin.item.prescriptionDate
                    )} - #${outcomeData.origin.item.idPrescription}`}
                    disabled
                  />
                  <Tooltip title="Abrir prescrição">
                    <Button
                      icon={<SearchOutlined />}
                      onClick={() =>
                        openPrescription(outcomeData.origin.item.idPrescription)
                      }
                    />
                  </Tooltip>
                </Space>
              </div>
            </div>

            {outcomeData.header?.economyType !== null && (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>
                      <Tooltip underline title={costPerDayHint}>
                        Custo por dia:
                      </Tooltip>
                    </label>
                  </div>
                  <div className="form-input">
                    <Space direction="horizontal">
                      <InputNumber
                        disabled
                        precision={INPUT_PRECISION}
                        addonBefore="R$"
                        value={Big(values.origin.pricePerDose || 0).times(
                          Big(values.origin.frequencyDay || 0)
                        )}
                        className={pricePerDayStatus("origin")}
                      />
                      <Tooltip title={details ? "Recolher" : "Detalhar"}>
                        <Button
                          icon={
                            details ? (
                              <CaretUpOutlined />
                            ) : (
                              <CaretDownOutlined />
                            )
                          }
                          shape="circle"
                          onClick={() => setDetails(!details)}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </div>

                <div className={`collapsible ${details ? "visible" : ""}`}>
                  <EconomyDayCalculator
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    outcomeData={{
                      header: outcomeData.header,
                      origin: outcomeData.original.origin,
                      destiny: outcomeData.original.destiny
                        ? outcomeData.original.destiny.find(
                            (i) =>
                              i.item?.idPrescriptionDrug ===
                              values.idPrescriptionDrugDestiny
                          )
                        : null,
                    }}
                    source="origin"
                    calcEconomyDay={calcEconomyDay}
                  />
                </div>
              </>
            )}
          </div>
        </Col>

        {outcomeData.destiny && (
          <Col xs={12} style={{ borderLeft: "1px solid #d9d9d9" }}>
            <div style={{ padding: "1rem" }}>
              <div className={`form-row`}>
                <div className="form-label">
                  <label>
                    <Tooltip
                      underline
                      title="Prescrição substituta é a prescrição alterada pelo médico conforme intervenção realizada."
                    >
                      Prescrição substituta:
                    </Tooltip>
                  </label>
                </div>
                <div className="form-input">
                  <Space direction="horizontal">
                    {outcomeData.destiny.length === 0 ? (
                      <Alert
                        description={`Não foram encontradas prescrições com este medicamento posteriores à intervenção.`}
                        type="error"
                        showIcon
                      />
                    ) : (
                      <>
                        <Select
                          optionFilterProp="children"
                          style={{ width: "290px" }}
                          value={values.idPrescriptionDrugDestiny}
                          onChange={(value) =>
                            onChangePrescriptionDestiny(value)
                          }
                          disabled={
                            outcomeData.destiny.length === 0 ||
                            outcomeData.header.readonly
                          }
                          status={
                            outcomeData.destiny.length === 0 ? "error" : ""
                          }
                          optionLabelProp="label"
                          options={outcomeData.destiny.map((i) => ({
                            ...i.item,
                            value: i.item.idPrescriptionDrug,
                            label: `${formatDate(i.item.prescriptionDate)} - #${
                              i.item.idPrescription
                            } - ${i.item.name}`,
                          }))}
                          optionRender={(option) => (
                            <PrescriptionOption>
                              <div className="date">
                                {formatDate(option.data.prescriptionDate)}
                              </div>
                              <div className="name">{option.data.name}</div>
                              <div className="detail">
                                {option.data.dose}{" "}
                                {option.data.idMeasureUnit || "-"} (
                                {option.data.route})
                              </div>
                              <div className="detail">
                                {option.data.frequencyDay} vez(es) ao dia
                              </div>
                            </PrescriptionOption>
                          )}
                        ></Select>
                        <Tooltip title="Abrir prescrição">
                          <Button
                            icon={<SearchOutlined />}
                            disabled={!values.idPrescriptionDrugDestiny}
                            onClick={() =>
                              openPrescription(values.destiny.idPrescription)
                            }
                          />
                        </Tooltip>
                      </>
                    )}
                  </Space>
                </div>
              </div>

              {values.destiny.idPrescription && (
                <>
                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>
                        <Tooltip underline title={costPerDayHint}>
                          Custo por dia:
                        </Tooltip>
                      </label>
                    </div>
                    <div className="form-input">
                      <Space direction="horizontal">
                        <InputNumber
                          disabled
                          precision={INPUT_PRECISION}
                          addonBefore="R$"
                          value={Big(values.destiny.pricePerDose).times(
                            values.destiny.frequencyDay
                          )}
                          className={pricePerDayStatus("destiny")}
                        />
                        <Tooltip title={details ? "Recolher" : "Detalhar"}>
                          <Button
                            icon={
                              details ? (
                                <CaretUpOutlined />
                              ) : (
                                <CaretDownOutlined />
                              )
                            }
                            shape="circle"
                            onClick={() => setDetails(!details)}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>

                  <div className={`collapsible ${details ? "visible" : ""}`}>
                    <EconomyDayCalculator
                      values={values}
                      errors={errors}
                      touched={touched}
                      setFieldValue={setFieldValue}
                      source="destiny"
                      outcomeData={{
                        header: outcomeData.header,
                        origin: outcomeData.original.origin,
                        destiny: outcomeData.original.destiny
                          ? outcomeData.original.destiny.find(
                              (i) =>
                                i.item?.idPrescriptionDrug ===
                                values.idPrescriptionDrugDestiny
                            )
                          : null,
                      }}
                      calcEconomyDay={calcEconomyDay}
                    />
                  </div>
                </>
              )}
            </div>
          </Col>
        )}
      </Row>

      {outcomeData.header?.economyType !== null && (
        <div className="result">
          <div className={`form-row`}>
            <div className="form-label">
              <label>
                <Tooltip underline title="Cálculo do valor economizado por dia">
                  Economia/Dia:
                </Tooltip>
              </label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <InputNumber
                  disabled={
                    !values.economyDayValueManual ||
                    outcomeData.header?.readonly
                  }
                  precision={INPUT_PRECISION}
                  addonBefore="R$"
                  onChange={(value) =>
                    values.economyDayValueManual
                      ? setFieldValue("economyDayValue", value)
                      : false
                  }
                  value={values.economyDayValue}
                  min={0}
                />
                <Checkbox
                  disabled={outcomeData.header?.readonly}
                  onChange={(e) => {
                    setFieldValue("economyDayValueManual", e.target.checked);
                    if (e.target.checked) {
                      setFieldValue("economyDayValue", 0);
                    } else {
                      setFieldValue(
                        "economyDayValue",
                        calcEconomyDay({
                          ...values,
                          economyDayValueManual: false,
                        })
                      );
                    }
                  }}
                  checked={values.economyDayValueManual}
                >
                  Manual
                </Checkbox>
              </Space>
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>
                <Tooltip
                  underline
                  title="Quantidade de dias de economia que serão considerados no Relatório de Farmacoeconomia caso a intervenção seja aceita. Se não for informado, a quantidade de dias será calculada considerando a data da intervenção até o dia da alta do paciente."
                >
                  Qtd. de dias de economia:
                </Tooltip>
              </label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                {values.economyDayAmountManual ? (
                  <InputNumber
                    disabled={outcomeData.header?.readonly}
                    precision={0}
                    addonAfter=" Dias"
                    onChange={(value) =>
                      setFieldValue("economyDayAmount", value)
                    }
                    value={values.economyDayAmount}
                    min={0}
                  />
                ) : (
                  <Input disabled={true} value={`Até a data de alta`} />
                )}

                <Checkbox
                  disabled={outcomeData.header?.readonly}
                  onChange={(e) => {
                    setFieldValue("economyDayAmountManual", e.target.checked);
                    if (e.target.checked) {
                      setFieldValue("economyDayAmount", 0);
                    } else {
                      setFieldValue("economyDayAmount", null);
                    }
                  }}
                  checked={values.economyDayAmountManual}
                >
                  Manual
                </Checkbox>
              </Space>
            </div>
          </div>
        </div>
      )}
    </InterventionOutcomeContainer>
  );
}
