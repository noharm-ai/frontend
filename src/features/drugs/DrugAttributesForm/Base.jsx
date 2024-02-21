import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { InputNumber, Select, Checkbox } from "components/Inputs";
import Tooltip from "components/Tooltip";
import { HelpButton } from "components/Button";

function BaseForm({ data }) {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue } = useFormikContext();
  const maxValue = 999999999;

  return (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>Classificação:</label>
        </div>
        <div className="form-input-checkbox">
          <Checkbox
            onChange={({ target }) => setFieldValue("antimicro", !target.value)}
            value={values.antimicro || false}
            checked={values.antimicro}
            name="antimicro"
            id="antimicro"
          >
            Antimicrobiano
          </Checkbox>

          <Checkbox
            onChange={({ target }) => setFieldValue("mav", !target.value)}
            value={values.mav || false}
            checked={values.mav}
            name="mav"
            id="mav"
          >
            Alta vigilância
          </Checkbox>

          <Checkbox
            onChange={({ target }) =>
              setFieldValue("controlled", !target.value)
            }
            value={values.controlled || false}
            checked={values.controlled}
            name="controlled"
            id="controlled"
          >
            Controlados
          </Checkbox>

          <Checkbox
            onChange={({ target }) =>
              setFieldValue("notdefault", !target.value)
            }
            value={values.notdefault || false}
            checked={values.notdefault}
            name="notdefault"
            id="notdefault"
          >
            Não padronizado
          </Checkbox>

          <Checkbox
            onChange={({ target }) => setFieldValue("elderly", !target.value)}
            value={values.elderly || false}
            checked={values.elderly}
            name="elderly"
            id="elderly"
          >
            <Tooltip
              title="Medicamento Potencialmente Inapropriado para Idosos"
              underline
            >
              MPI
            </Tooltip>
          </Checkbox>

          <Checkbox
            onChange={({ target }) => setFieldValue("whiteList", !target.value)}
            value={values.whiteList || false}
            checked={values.whiteList}
            name="whiteList"
            id="whiteList"
          >
            <Tooltip
              title="Medicamento isento de Validação e Escore (Ex.: Diluentes, Componentes)"
              underline
            >
              Sem validação
            </Tooltip>
          </Checkbox>

          <Checkbox
            onChange={({ target }) => setFieldValue("tube", !target.value)}
            value={values.tube || false}
            checked={values.tube}
            name="tube"
            id="tube"
          >
            <Tooltip
              title="Medicamento contraindicado via Sonda Nasoenteral, Nasogástrica, Enteral, Jejunostomia ou Gastrostomia"
              underline
            >
              Sonda
            </Tooltip>
          </Checkbox>

          <Checkbox
            onChange={({ target }) => setFieldValue("chemo", !target.value)}
            value={values.chemo || false}
            checked={values.chemo}
            name="chemo"
            id="chemo"
          >
            Quimioterápico
          </Checkbox>
        </div>
      </div>

      <div
        className={`form-row ${errors.price && touched.price ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Custo:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.price}
            onChange={(value) => setFieldValue("price", value)}
            status={errors.price && touched.price ? "error" : null}
          />
          {data.idMeasureUnitPrice
            ? data.idMeasureUnitPrice
            : "Sem unidade definida"}
        </div>
        {errors.price && touched.price && (
          <div className="form-error">{errors.price}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.maxTime && touched.maxTime ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Alerta de Tempo de Tratamento:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.maxTime}
            onChange={(value) => setFieldValue("maxTime", value)}
            status={errors.maxTime && touched.maxTime ? "error" : null}
          />
          dias
        </div>
        {errors.maxTime && touched.maxTime && (
          <div className="form-error">{errors.maxTime}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.maxDose && touched.maxDose ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>
            <Tooltip title="Dose de Alerta Diária">Dose de Alerta:</Tooltip>
          </label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.maxDose}
            onChange={(value) => setFieldValue("maxDose", value)}
            status={errors.maxDose && touched.maxDose ? "error" : null}
          />
          {data.idMeasureUnit}
          {data.useWeight ? "/Kg/dia" : ""}
        </div>
        {errors.maxDose && touched.maxDose && (
          <div className="form-error">{errors.maxDose}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.kidney && touched.kidney ? "error" : ""}`}
      >
        <div className="form-label">
          <label>
            <Tooltip
              title="Valor de Taxa de Filtração Glomerular (CKD-EPI) a partir do qual o medicamento deve sofrer ajuste de dose ou frequência."
              underline
            >
              Nefrotóxico:
            </Tooltip>
          </label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.kidney}
            onChange={(value) => setFieldValue("kidney", value)}
            status={errors.kidney && touched.kidney ? "error" : null}
          />
          mL/min
          <Tooltip title={t("layout.help")}>
            <HelpButton
              type="primary gtm-medication-btn-help-nefro"
              href={`${process.env.REACT_APP_SUPPORT_LINK}/kb/article/ajuste-de-dose-por-funcao-renal`}
            />
          </Tooltip>
        </div>
        {errors.kidney && touched.kidney && (
          <div className="form-error">{errors.kidney}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.liver && touched.liver ? "error" : ""}`}
      >
        <div className="form-label">
          <label>
            <Tooltip
              title="Valor de TGO ou TGP a partir do qual o medicamento deve sofrer ajuste de dose ou frequência."
              underline
            >
              Hepatotóxico:
            </Tooltip>
          </label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.liver}
            onChange={(value) => setFieldValue("liver", value)}
            status={errors.liver && touched.liver ? "error" : null}
          />
          U/L
          <Tooltip title={t("layout.help")}>
            <HelpButton
              type="primary gtm-medication-btn-help-hepa"
              href={`${process.env.REACT_APP_SUPPORT_LINK}/kb/article/ajuste-de-dose-por-funcao-hepatica`}
            />
          </Tooltip>
        </div>
        {errors.liver && touched.liver && (
          <div className="form-error">{errors.liver}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.platelets && touched.platelets ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>
            <Tooltip
              title="Valor de Plaquetas/µL abaixo do qual o uso do medicamento é inadequado."
              underline
            >
              Alerta de Plaquetas:
            </Tooltip>
          </label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.platelets}
            onChange={(value) => setFieldValue("platelets", value)}
            status={errors.platelets && touched.platelets ? "error" : null}
          />
          plaquetas/µL
        </div>
        {errors.platelets && touched.platelets && (
          <div className="form-error">{errors.platelets}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.fallRisk && touched.fallRisk ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Risco de Queda:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={1}
            max={4}
            value={values.fallRisk}
            onChange={(value) => setFieldValue("fallRisk", value)}
            status={errors.fallRisk && touched.fallRisk ? "error" : null}
          />
          Valor entre 1 e 4
        </div>
        {errors.fallRisk && touched.fallRisk && (
          <div className="form-error">{errors.fallRisk}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.amount && touched.amount ? "error" : ""}`}
      >
        <div className="form-label">
          <label>
            <Tooltip
              title="Informação que será utilizada na calculadora de soluções"
              underline
            >
              Concentração:
            </Tooltip>
          </label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
              marginRight: 5,
            }}
            min={0}
            max={maxValue}
            value={values.amount}
            onChange={(value) => setFieldValue("amount", value)}
            status={errors.amount && touched.amount ? "error" : null}
          />
        </div>
        {errors.amount && touched.amount && (
          <div className="form-error">{errors.amount}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.amountUnit && touched.amountUnit ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>
            <Tooltip
              title="Informação que será utilizada na calculadora de soluções"
              underline
            >
              Unidade da concentração:
            </Tooltip>
          </label>
        </div>
        <div className="form-input">
          <Select
            placeholder="Selecione a unidade da concentração"
            onChange={(value) => {
              setFieldValue("amountUnit", value || null);
            }}
            value={values.amountUnit}
            allowClear
            style={{ maxWidth: "300px" }}
          >
            <Select.Option value="mEq" key="mEq">
              mEq
            </Select.Option>
            <Select.Option value="mg" key="mg">
              mg
            </Select.Option>
            <Select.Option value="mcg" key="mcg">
              mcg
            </Select.Option>
            <Select.Option value="mmol" key="mmol">
              mmol
            </Select.Option>
            <Select.Option value="U" key="U">
              U
            </Select.Option>
            <Select.Option value="UI" key="UI">
              UI
            </Select.Option>
          </Select>{" "}
          &nbsp; /mL
        </div>
        {errors.amountUnit && touched.amountUnit && (
          <div className="form-error">{errors.amountUnit}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
