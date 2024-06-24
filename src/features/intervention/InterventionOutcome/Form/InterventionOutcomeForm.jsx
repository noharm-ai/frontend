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
import { formatNumber } from "utils/number";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import EconomyDayCalculator from "./EconomyDayCalculator";
import SecurityService from "services/security";

import {
  InterventionOutcomeContainer,
  PrescriptionOption,
} from "../InterventionOutcome.style";

const INPUT_PRECISION = 6;

export default function InterventionOutcomeForm() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const outcomeData = useSelector((state) => state.interventionOutcome.data);
  const loadStatus = useSelector((state) => state.interventionOutcome.status);
  const roles = useSelector((state) => state.user.account.roles);
  const [details, setDetails] = useState(false);

  const securityService = SecurityService(roles);
  const costPerDayHint =
    "(Dose dispensada X Custo + Custo Kit) X Frequência/Dia";
  const economyDaysHint = {
    1: "Até a data de alta",
    2: "Enquanto prescrito",
    3: "Especificar",
  };

  const onChangePrescriptionDestiny = (value) => {
    setFieldValue("idPrescriptionDrugDestiny", value);

    outcomeData.destiny.forEach((dData) => {
      if (dData.item.idPrescriptionDrug === value) {
        setFieldValue("destiny", dData.item);

        const newValues = {
          ...values,
          destiny: {
            ...dData.item,
          },
        };

        const pricePerDose = Big(newValues.destiny.price || 0)
          .times(Big(newValues.destiny.dose || 0))
          .plus(Big(newValues.destiny.priceKit || 0));

        newValues.destiny.pricePerDose = pricePerDose;

        if (!values.economyDayValueManual) {
          setFieldValue("economyDayValue", calcEconomyDay(newValues));
        }
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

      return economy;
    }

    if (
      outcomeData.header?.economyType === 1 &&
      formValues.origin.pricePerDose &&
      formValues.origin.frequencyDay
    ) {
      const economy = Big(formValues.origin.pricePerDose).times(
        formValues.origin.frequencyDay
      );

      return economy;
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

  const SubstitutionAlert = () => (
    <>
      Não foram encontradas prescrições com este medicamento posteriores à
      intervenção.
      <br />
      <br />
      Se for uma <strong>Suspensão</strong>, altere o motivo desta intervenção.
      <br />
      <br />
      Caso contrário, informe <strong>manualmente</strong> a Economia/Dia e a
      Quantidade de dias de economia.
    </>
  );

  if (loadStatus === "loading" || isEmpty(outcomeData)) {
    return null;
  }

  if (!outcomeData.header?.economyType) {
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
            <div className="form-value">
              {outcomeData.header?.patient
                ? "Intervenção no paciente"
                : outcomeData.header.originDrug}
            </div>
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
              <div className="form-value">
                {values.destiny?.name || outcomeData.header.destinyDrug}
              </div>
            </div>
          </Col>
        )}
      </Row>

      <Row gutter={24}>
        <Col xs={outcomeData.header?.economyType === 2 ? 12 : 24}>
          <div style={{ padding: "1rem" }}>
            {outcomeData.header?.economyType === 1 ||
              (outcomeData.header?.economyType === 3 && (
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Tipo:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData.header?.economyType === 1
                      ? "Suspensão"
                      : "Economia customizada"}
                  </div>
                </div>
              ))}

            <div className={`form-row`}>
              <div className="form-label">
                <label>Prescrição:</label>
              </div>
              <div className="form-input">
                <Space direction="horizontal">
                  <Input
                    value={
                      securityService.hasCpoe()
                        ? `${formatDate(
                            outcomeData?.header?.economyIniDate
                          )} - #${
                            outcomeData.origin.item.idPrescriptionAggregate
                          }`
                        : `${formatDate(
                            outcomeData.origin.item.prescriptionDate
                          )} - #${outcomeData.origin.item.idPrescription}`
                    }
                    disabled
                  />
                  <Tooltip title="Abrir prescrição">
                    <Button
                      icon={<SearchOutlined />}
                      onClick={() =>
                        openPrescription(
                          securityService.hasCpoe()
                            ? outcomeData.origin.item.idPrescriptionAggregate
                            : outcomeData.origin.item.idPrescription
                        )
                      }
                    />
                  </Tooltip>
                </Space>
              </div>
            </div>

            {outcomeData.header?.economyType !== null &&
              outcomeData.header?.economyType !== 3 && (
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
                        description={<SubstitutionAlert />}
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
                            label: securityService.hasCpoe()
                              ? `${formatDate(i.item.prescriptionDate)} - #${
                                  i.item.idPrescriptionAggregate
                                }`
                              : `${formatDate(i.item.prescriptionDate)} - #${
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
                                {formatNumber(option.data.dose, 4)}{" "}
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
                              openPrescription(
                                securityService.hasCpoe()
                                  ? values.destiny.idPrescriptionAggregate
                                  : values.destiny.idPrescription
                              )
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
                          value={Big(values.destiny.pricePerDose || 0).times(
                            Big(values.destiny.frequencyDay || 0)
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
                  className={values.economyDayValue > 0 ? "success" : ""}
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
                  title="Quantidade de dias de economia que serão considerados no Relatório de Farmacoeconomia caso a intervenção seja aceita. Se não for informado, a quantidade de dias será calculada considerando a data da intervenção até o dia da alta do paciente (suspensão) ou enquanto estiver prescrito (substituição)."
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
                    min={1}
                  />
                ) : (
                  <Input
                    disabled={true}
                    value={
                      economyDaysHint[outcomeData?.header?.economyType]
                        ? economyDaysHint[outcomeData?.header?.economyType]
                        : ""
                    }
                  />
                )}

                <Checkbox
                  disabled={outcomeData.header?.readonly}
                  onChange={(e) => {
                    setFieldValue("economyDayAmountManual", e.target.checked);
                    if (e.target.checked) {
                      setFieldValue("economyDayAmount", 1);
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

          {outcomeData?.header?.readonly && (
            <>
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Período total de economia:</label>
                </div>
                <div className="form-value">
                  De{" "}
                  <strong>
                    {formatDate(outcomeData?.header?.economyIniDate)}
                  </strong>{" "}
                  até{" "}
                  <strong>
                    {outcomeData?.header?.economyEndDate ? (
                      formatDate(outcomeData?.header?.economyEndDate)
                    ) : (
                      <Tooltip
                        underline
                        title="Período de economia ainda não possui data de encerramento"
                      >
                        Em aberto
                      </Tooltip>
                    )}
                  </strong>
                </div>
              </div>
              {outcomeData?.header?.outcomeUser && (
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Responsável pelo desfecho:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData?.header?.outcomeUser} em{" "}
                    {formatDate(outcomeData?.header.outcomeAt)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </InterventionOutcomeContainer>
  );
}
