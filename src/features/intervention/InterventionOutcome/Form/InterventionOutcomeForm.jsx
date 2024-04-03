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

import { InputNumber, Input, Select } from "components/Inputs";
import { formatDate } from "utils/date";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import EconomyDayCalculator from "./EconomyDayCalculator";

import { InterventionOutcomeContainer } from "../InterventionOutcome.style";

export default function InterventionOutcomeForm() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const outcomeData = useSelector((state) => state.interventionOutcome.data);
  const loadStatus = useSelector((state) => state.interventionOutcome.status);
  const [details, setDetails] = useState(false);
  const costPerDayHint =
    "(Dose dispensada X Custo + Custo Kit) X Frequência/Dia";

  const onChangePrescriptionDestiny = (value) => {
    setFieldValue("idPrescriptionDestiny", value);

    outcomeData.destiny.forEach((dData) => {
      if (dData.item.idPrescription === value) {
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
      const economy =
        formValues.origin.pricePerDose * formValues.origin.frequencyDay -
        formValues.destiny.pricePerDose * formValues.destiny.frequencyDay;

      return economy < 0 ? 0 : economy;
    }

    if (
      outcomeData.header?.economyType === 1 &&
      formValues.origin.pricePerDose &&
      formValues.origin.frequencyDay
    ) {
      const economy =
        formValues.origin.pricePerDose * formValues.origin.frequencyDay;

      return economy < 0 ? 0 : economy;
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
            (i) => i.item?.idPrescription === values.idPrescriptionDestiny
          )
        : {};
    }

    const fields = ["dose", "frequencyDay", "price", "priceKit"];

    const fieldsStatus = fields.map((f) =>
      values[source][f] !== original.item[f] ? "warning" : ""
    );
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
                    value={`#${
                      outcomeData.origin.item.idPrescription
                    } - ${formatDate(
                      outcomeData.origin.item.prescriptionDate
                    )}`}
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
                        precision={2}
                        addonBefore="R$"
                        value={
                          values.origin.pricePerDose *
                          values.origin.frequencyDay
                        }
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
                              i.item?.idPrescription ===
                              values.idPrescriptionDestiny
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
                          style={{ width: "100%" }}
                          value={values.idPrescriptionDestiny}
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
                        >
                          {outcomeData.destiny.length > 0 &&
                            outcomeData.destiny.map((dData) => (
                              <Select.Option
                                key={dData.item.idPrescription}
                                value={dData.item.idPrescription}
                              >
                                #{dData.item.idPrescription} -{" "}
                                {formatDate(dData.item.prescriptionDate)}
                              </Select.Option>
                            ))}
                        </Select>
                        <Tooltip title="Abrir prescrição">
                          <Button
                            icon={<SearchOutlined />}
                            disabled={!values.idPrescriptionDestiny}
                            onClick={() =>
                              openPrescription(values.idPrescriptionDestiny)
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
                          precision={2}
                          addonBefore="R$"
                          value={
                            values.destiny.pricePerDose *
                            values.destiny.frequencyDay
                          }
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
                                i.item?.idPrescription ===
                                values.idPrescriptionDestiny
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
                  precision={2}
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
                    precision={2}
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
