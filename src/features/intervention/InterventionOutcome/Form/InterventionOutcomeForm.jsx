import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

import { InputNumber } from "components/Inputs";

export default function InterventionOutcomeForm() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const outcomeData = useSelector((state) => state.interventionOutcome.data);

  const loadStatus = useSelector((state) => state.interventionOutcome.status);

  const onChangeDose = (value) => {
    setFieldValue("origin.dose", value);
    setFieldValue(
      "origin.pricePerDose",
      values.origin.price * value + values.origin.priceKit
    );
  };

  const onChangeCost = (value) => {
    setFieldValue("origin.price", value);
    setFieldValue(
      "origin.pricePerDose",
      values.origin.dose * value + values.origin.priceKit
    );
  };

  const onChangeKitCost = (value) => {
    setFieldValue("origin.priceKit", value);
    setFieldValue(
      "origin.pricePerDose",
      values.origin.dose * values.origin.price + value
    );
  };

  if (loadStatus === "loading") {
    return null;
  }

  return (
    <>
      <h4>Origem: {outcomeData.origin.item.name}</h4>
      <div>
        Prescrição: #{outcomeData.origin.item.idPrescription} -
        {outcomeData.origin.item.prescriptionDate}
      </div>
      <br />
      <div>
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
        <strong>Custo convertido:</strong> R$ {outcomeData.origin.item.price} /{" "}
        {outcomeData.origin.item.idMeasureUnit}
      </div>
      <div>
        Custo original: R$ {outcomeData.origin.item.beforeConversion.price} /{" "}
        {outcomeData.origin.item.beforeConversion.idMeasureUnitPrice} (Fator:{" "}
        {outcomeData.origin.item.conversion.priceFactor})
      </div>
      <br />
      <div>Frequência: {outcomeData.origin.item.idFrequency}</div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo / {outcomeData.origin.item.idMeasureUnit}:</label>
        </div>
        <div className="form-input">
          <InputNumber
            onChange={(value) => onChangeCost(value)}
            value={values.origin.price}
            status={
              errors.origin?.price && touched.origin?.price ? "error" : null
            }
          />
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>
            Dose despendida ({outcomeData.origin.item.idMeasureUnit}):
          </label>
        </div>
        <div className="form-input">
          <InputNumber
            onChange={(value) => onChangeDose(value)}
            value={values.origin.dose}
            status={
              errors.origin?.dose && touched.origin?.dose ? "error" : null
            }
          />
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo KIT:</label>
        </div>
        <div className="form-input">
          <InputNumber
            onChange={(value) => onChangeKitCost(value)}
            value={values.origin.priceKit}
            status={
              errors.origin?.priceKit && touched.origin?.priceKit
                ? "error"
                : null
            }
          />
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo por administração (R$):</label>
        </div>
        <div className="form-input">R$ {values.origin.pricePerDose}</div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo por dia:</label>
        </div>
        <div className="form-input">
          R$ {values.origin.pricePerDose * values.origin.frequencyDay}
        </div>
      </div>
    </>
  );
}
