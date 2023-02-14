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
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-input">
          <Switch
            id="active"
            name="active"
            checked={values.active}
            onChange={(value) => setFieldValue("active", value)}
            onBlur={handleBlur}
            status={errors.active && touched.active ? "error" : null}
            checkedChildren={t("labels.active")}
            unCheckedChildren={t("labels.inactive")}
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
