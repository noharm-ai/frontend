import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Input, Select } from "components/Inputs";
import Switch from "components/Switch";

import { selectParentInterventionReasons } from "../InterventionReasonSlice";

function BaseForm() {
  const { t } = useTranslation();
  const parents = useSelector(selectParentInterventionReasons);
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    useFormikContext();

  return (
    <>
      <div
        className={`form-row ${
          errors.parentId && touched.parentId ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.parentReason")}:</label>
        </div>
        <div className="form-input">
          <Select
            id="parentId"
            name="parentId"
            onChange={(value) => setFieldValue("parentId", value)}
            onBlur={handleBlur}
            value={values.parentId}
            status={errors.parentId && touched.parentId ? "error" : null}
            optionFilterProp="children"
            disabled={values.protected}
            showSearch
            autoFocus
            allowClear
          >
            {parents &&
              parents.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
          </Select>
        </div>
        {errors.parentId && touched.parentId && (
          <div className="form-error">{errors.parentId}</div>
        )}
      </div>
      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label">
          <label>{t("labels.reason")}:</label>
        </div>
        <div className="form-input">
          <Input
            id="name"
            name="name"
            disabled={values.protected}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            status={errors.name && touched.name ? "error" : null}
          />
        </div>
        {errors.name && touched.name && (
          <div className="form-error">{errors.name}</div>
        )}
        {values.protected && (
          <div className="form-info">{t("tooltips.cantEditBeingUsed")}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.relationType && touched.relationType ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.relations")}:</label>
        </div>
        <div className="form-input">
          <Select
            id="relationType"
            name="relationType"
            onChange={(value) => setFieldValue("relationType", value)}
            onBlur={handleBlur}
            value={values.relationType}
            status={
              errors.relationType && touched.relationType ? "error" : null
            }
            optionFilterProp="children"
            showSearch
          >
            <Select.Option key={0} value={0}>
              Não habilita relações
            </Select.Option>
            <Select.Option key={1} value={1}>
              Habilita relações (opcional)
            </Select.Option>
            <Select.Option key={2} value={2}>
              Habilita relações (obrigatório)
            </Select.Option>
          </Select>
        </div>
        {errors.relationType && touched.relationType && (
          <div className="form-error">{errors.relationType}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.suspension && touched.suspension ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Tipo economia Suspensão:</label>
        </div>
        <div className="form-input">
          <Switch
            id="suspension"
            name="suspension"
            checked={values.suspension}
            onChange={(value) => setFieldValue("suspension", value)}
            onBlur={handleBlur}
            status={errors.suspension && touched.suspension ? "error" : null}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.suspension && touched.suspension && (
          <div className="form-error">{errors.suspension}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.substitution && touched.substitution ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Tipo economia Substituição:</label>
        </div>
        <div className="form-input">
          <Switch
            id="substitution"
            name="substitution"
            checked={values.substitution}
            onChange={(value) => setFieldValue("substitution", value)}
            onBlur={handleBlur}
            status={
              errors.substitution && touched.substitution ? "error" : null
            }
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.substitution && touched.substitution && (
          <div className="form-error">{errors.substitution}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.customEconomy && touched.customEconomy ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Tipo economia Customizado:</label>
        </div>
        <div className="form-input">
          <Switch
            id="customEconomy"
            name="customEconomy"
            checked={values.customEconomy}
            onChange={(value) => setFieldValue("customEconomy", value)}
            onBlur={handleBlur}
            status={
              errors.customEconomy && touched.customEconomy ? "error" : null
            }
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.customEconomy && touched.customEconomy && (
          <div className="form-error">{errors.customEconomy}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.blocking && touched.blocking ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Bloqueante:</label>
        </div>
        <div className="form-input">
          <Switch
            id="blocking"
            name="blocking"
            checked={values.blocking}
            onChange={(value) => setFieldValue("blocking", value)}
            onBlur={handleBlur}
            status={errors.blocking && touched.blocking ? "error" : null}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.blocking && touched.blocking && (
          <div className="form-error">{errors.blocking}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>{t("labels.active")}:</label>
        </div>
        <div className="form-input">
          <Switch
            id="active"
            name="active"
            checked={values.active}
            onChange={(value) => setFieldValue("active", value)}
            onBlur={handleBlur}
            status={errors.active && touched.active ? "error" : null}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.active && touched.active && (
          <div className="form-error">{errors.active}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
