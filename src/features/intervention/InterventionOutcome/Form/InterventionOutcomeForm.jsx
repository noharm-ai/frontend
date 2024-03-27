import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { Row, Col, Space } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";

import { InputNumber, Input, Select } from "components/Inputs";
import NumericValue from "components/NumericValue";
import { formatDate } from "utils/date";
import Button from "components/Button";
import Tooltip from "components/Tooltip";

export default function InterventionOutcomeForm() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const outcomeData = useSelector((state) => state.interventionOutcome.data);

  const loadStatus = useSelector((state) => state.interventionOutcome.status);

  const onChangeDose = (source, value) => {
    setFieldValue(`${source}.dose`, value);
    setFieldValue(
      `${source}.pricePerDose`,
      values.origin.price * value + values.origin.priceKit
    );
  };

  const onChangeCost = (source, value) => {
    setFieldValue(`${source}.price`, value);
    setFieldValue(
      `${source}.pricePerDose`,
      values.origin.dose * value + values.origin.priceKit
    );
  };

  const onChangeKitCost = (source, value) => {
    setFieldValue(`${source}.priceKit`, value);
    setFieldValue(
      `${source}.pricePerDose`,
      values.origin.dose * values.origin.price + value
    );
  };

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

  if (loadStatus === "loading") {
    return null;
  }

  return (
    <Row gutter={24}>
      <Col xs={12}>
        <div className={`form-row`}>
          <div className="form-label">
            <label>Origem:</label>
          </div>
          <div className="form-readonly">{outcomeData.origin.item.name}</div>
        </div>

        <div style={{ padding: "1rem" }}>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Prescrição:</label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <Input
                  value={`#${
                    outcomeData.origin.item.idPrescription
                  } - ${formatDate(outcomeData.origin.item.prescriptionDate)}`}
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

          {/* <div>
          <strong>Dose convertida:</strong> {outcomeData.origin.item.dose}{" "}
          {outcomeData.origin.item.idMeasureUnit} (Fator:{" "}
          {outcomeData.origin.item.conversion.doseFactor})
        </div>
        <div>
          Dose original: {outcomeData.origin.item.beforeConversion.dose}{" "}
          {outcomeData.origin.item.beforeConversion.idMeasureUnit}
        </div>
        <br />
        <div>
          <strong>Custo convertido:</strong> R$ {outcomeData.origin.item.price}{" "}
          / {outcomeData.origin.item.idMeasureUnit}
        </div>
        <div>
          Custo original: R$ {outcomeData.origin.item.beforeConversion.price} /{" "}
          {outcomeData.origin.item.beforeConversion.idMeasureUnitPrice} (Fator:{" "}
          {outcomeData.origin.item.conversion.priceFactor})
        </div>
        <br />
        <div>
          <strong>Frequência convertida:</strong>{" "}
          {outcomeData.origin.item.frequencyDay} / Dia
        </div>
        <div>Frequência original: {outcomeData.origin.item.idFrequency}</div> */}

          <div className={`form-row`}>
            <div className="form-label">
              <label>
                Dose despendida ({outcomeData.origin.item.idMeasureUnit}):
              </label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <InputNumber
                  onChange={(value) => onChangeDose("origin", value)}
                  value={values.origin.dose}
                  status={
                    errors.origin?.dose && touched.origin?.dose ? "error" : null
                  }
                />
                <Tooltip title="Abrir prescrição">
                  <Button icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Frequência/Dia:</label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <InputNumber
                  onChange={(value) =>
                    setFieldValue("origin.frequencyDay", value)
                  }
                  value={values.origin.frequencyDay}
                  status={
                    errors.origin?.frequencyDay && touched.origin?.frequencyDay
                      ? "error"
                      : null
                  }
                />
                <Tooltip title="Abrir prescrição">
                  <Button icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Custo / {outcomeData.origin.item.idMeasureUnit}:</label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <InputNumber
                  precision={2}
                  addonBefore="R$"
                  onChange={(value) => onChangeCost("origin", value)}
                  value={values.origin.price}
                  status={
                    errors.origin?.price && touched.origin?.price
                      ? "error"
                      : null
                  }
                />
                <Tooltip title="Abrir prescrição">
                  <Button icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Custo KIT:</label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <InputNumber
                  addonBefore="R$"
                  onChange={(value) => onChangeKitCost("origin", value)}
                  value={values.origin.priceKit}
                  status={
                    errors.origin?.priceKit && touched.origin?.priceKit
                      ? "error"
                      : null
                  }
                />
                <Tooltip title="Abrir prescrição">
                  <Button icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </div>

          {/* <div className={`form-row`}>
          <div className="form-label">
            <label>Custo por horário:</label>
          </div>
          <div className="form-input">
            <Space direction="horizontal">
              <InputNumber
                disabled
                precision={2}
                addonBefore="R$"
                value={values.origin.pricePerDose}
              />
              <Tooltip title="Abrir prescrição">
                <Button icon={<InfoCircleOutlined />} />
              </Tooltip>
            </Space>
          </div>
        </div> */}

          <div className={`form-row`}>
            <div className="form-label">
              <label>Custo por dia:</label>
            </div>
            <div className="form-input">
              <Space direction="horizontal">
                <InputNumber
                  disabled
                  precision={2}
                  addonBefore="R$"
                  value={
                    values.origin.pricePerDose * values.origin.frequencyDay
                  }
                />
                <Tooltip title="Abrir prescrição">
                  <Button icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </div>
        </div>
      </Col>

      {outcomeData.destiny && outcomeData.destiny.length > 0 && (
        <Col xs={12} style={{ borderLeft: "1px solid #d9d9d9" }}>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Substituição:</label>
            </div>
            <div className="form-readonly">
              {outcomeData.destiny[0]?.item.name}
            </div>
          </div>

          <div style={{ padding: "1rem" }}>
            <div className={`form-row`}>
              <div className="form-label">
                <label>Prescrição substituta:</label>
              </div>
              <div className="form-input">
                <Space direction="horizontal">
                  <Select
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={values.idPrescriptionDestiny}
                    onChange={(value) => onChangePrescriptionDestiny(value)}
                  >
                    {outcomeData.destiny.map((dData) => (
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
                </Space>
              </div>
            </div>

            {values.destiny.idPrescription && (
              <>
                {/* <br />
                <div>
                  <strong>Dose convertida:</strong> {values.destiny.dose}{" "}
                  {values.destiny.idMeasureUnit} (Fator:{" "}
                  {values.destiny.conversion.doseFactor})
                </div>
                <div>
                  Dose original: {values.destiny.beforeConversion.dose}{" "}
                  {values.destiny.beforeConversion.idMeasureUnit}
                </div>
                <br />
                <div>
                  <strong>Custo convertido:</strong> R$ {values.destiny.price} /{" "}
                  {values.destiny.idMeasureUnit}
                </div>
                <div>
                  Custo original: R$ {values.destiny.beforeConversion.price} /{" "}
                  {values.destiny.beforeConversion.idMeasureUnitPrice} (Fator:{" "}
                  {values.destiny.conversion.priceFactor})
                </div>
                <br />
                <div>
                  <strong>Frequência convertida:</strong>{" "}
                  {values.destiny.frequencyDay} / Dia
                </div>
                <div>Frequência: {values.destiny.idFrequency}</div>

                <br /> */}

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>
                      Dose despendida ({values.destiny.idMeasureUnit}):
                    </label>
                  </div>
                  <div className="form-input">
                    <Space direction="horizontal">
                      <InputNumber
                        onChange={(value) => onChangeDose("destiny", value)}
                        value={values.destiny.dose}
                        status={
                          errors.destiny?.dose && touched.destiny?.dose
                            ? "error"
                            : null
                        }
                      />
                      <Tooltip title="Abrir prescrição">
                        <Button icon={<InfoCircleOutlined />} />
                      </Tooltip>
                    </Space>
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Frequência/Dia:</label>
                  </div>
                  <div className="form-input">
                    <Space direction="horizontal">
                      <InputNumber
                        onChange={(value) =>
                          setFieldValue("destiny.frequencyDay", value)
                        }
                        value={values.destiny.frequencyDay}
                        status={
                          errors.destiny?.frequencyDay &&
                          touched.destiny?.frequencyDay
                            ? "error"
                            : null
                        }
                      />
                      <Tooltip title="Abrir prescrição">
                        <Button icon={<InfoCircleOutlined />} />
                      </Tooltip>
                    </Space>
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Custo / {values.destiny.idMeasureUnit}:</label>
                  </div>
                  <div className="form-input">
                    <Space direction="horizontal">
                      <InputNumber
                        precision={2}
                        addonBefore="R$"
                        value={values.destiny.price}
                        status={
                          errors.destiny?.price && touched.destiny?.price
                            ? "error"
                            : null
                        }
                      />
                      <Tooltip title="Abrir prescrição">
                        <Button icon={<InfoCircleOutlined />} />
                      </Tooltip>
                    </Space>
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Custo KIT:</label>
                  </div>
                  <div className="form-input">
                    <Space direction="horizontal">
                      <InputNumber
                        precision={2}
                        addonBefore="R$"
                        onChange={(value) => onChangeKitCost("destiny", value)}
                        value={values.destiny.priceKit}
                        status={
                          errors.destiny?.priceKit && touched.destiny?.priceKit
                            ? "error"
                            : null
                        }
                      />
                      <Tooltip title="Abrir prescrição">
                        <Button icon={<InfoCircleOutlined />} />
                      </Tooltip>
                    </Space>
                  </div>
                </div>

                {/* <div className={`form-row`}>
                  <div className="form-label">
                    <label>Custo por horário:</label>
                  </div>
                  <div className="form-input">
                    <NumericValue
                      prefix="R$ "
                      value={values.destiny.pricePerDose}
                      decimalScale={2}
                    />
                  </div>
                </div> */}

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Custo por dia:</label>
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
                      />
                      <Tooltip title="Abrir prescrição">
                        <Button icon={<InfoCircleOutlined />} />
                      </Tooltip>
                    </Space>
                  </div>
                </div>

                <div className={`form-row`} style={{ background: "#edeaea" }}>
                  <div className="form-label">
                    <label>
                      <strong>Economia/Dia:</strong>
                    </label>
                  </div>
                  <div className="form-input">
                    <NumericValue
                      prefix="R$ "
                      value={
                        values.origin.pricePerDose *
                          values.origin.frequencyDay -
                        values.destiny.pricePerDose *
                          values.destiny.frequencyDay
                      }
                      decimalScale={2}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Col>
      )}
    </Row>
  );
}
