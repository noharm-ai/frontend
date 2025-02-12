import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import Switch from "components/Switch";
import { Select } from "components/Inputs";
import Editor from "components/Editor";
import DrugAlertInteractionTypeEnum from "models/DrugAlertInteractionTypeEnum";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext();
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesLoading =
    useSelector((state) => state.lists.getSubstances.status) === "loading";

  return (
    <>
      <div className={`form-row ${errors.sctida ? "error" : ""}`}>
        <div className="form-label">
          <label>Substância origem:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.sctida}
            onChange={(value) => setFieldValue("sctida", value)}
            loading={substancesLoading}
            allowClear
            disabled={!values.new}
          >
            {substances.map(({ sctid, name }) => (
              <Select.Option key={sctid} value={sctid}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.sctida && <div className="form-error">{errors.sctida}</div>}
      </div>

      <div className={`form-row ${errors.sctidb ? "error" : ""}`}>
        <div className="form-label">
          <label>Substância relacionada:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.sctidb}
            onChange={(value) => setFieldValue("sctidb", value)}
            loading={substancesLoading}
            allowClear
            disabled={!values.new}
          >
            {substances.map(({ sctid, name }) => (
              <Select.Option key={sctid} value={sctid}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.sctidb && <div className="form-error">{errors.sctidb}</div>}
      </div>

      <div className={`form-row ${errors.kind ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo:</label>
        </div>
        <div className="form-input">
          <Select
            id="type"
            showSearch
            optionFilterProp="children"
            style={{ width: "100%" }}
            placeholder="Selecione o tipo de relação..."
            onChange={(value) => setFieldValue("kind", value)}
            value={values.kind}
            disabled={!values.new}
          >
            {DrugAlertInteractionTypeEnum.getAlertInteractionTypes(t).map(
              (a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.label}
                </Select.Option>
              )
            )}
          </Select>
        </div>
        {errors.kind && <div className="form-error">{errors.kind}</div>}
      </div>

      <div className={`form-row ${errors.level ? "error" : ""}`}>
        <div className="form-label">
          <label>Nível:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            onChange={(value) => setFieldValue("level", value)}
            value={values.level}
            style={{ width: "100%" }}
          >
            <Select.Option key={"low"} value={"low"}>
              Baixo
            </Select.Option>
            <Select.Option key={"medium"} value={"medium"}>
              Médio
            </Select.Option>
            <Select.Option key={"high"} value={"high"}>
              Alto
            </Select.Option>
          </Select>
        </div>
        {errors.level && <div className="form-error">{errors.level}</div>}
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Efeito:</label>
        </div>
        <div className="form-input">
          <Editor
            onEdit={(text) => setFieldValue(`text`, text)}
            content={values.text || ""}
            utilities={["basic", "link"]}
          />
        </div>
      </div>

      <div className={`form-row ${errors.text ? "error" : ""}`}>
        <div className="form-label">
          <label>Ativo:</label>
        </div>
        <div className="form-input">
          <Switch
            checked={values.active}
            onChange={(value) => setFieldValue("active", value)}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>
    </>
  );
}

export default BaseForm;
