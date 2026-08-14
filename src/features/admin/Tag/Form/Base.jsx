import React, { useRef, useEffect } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import Switch from "components/Switch";
import { Input, Select } from "components/Inputs";
import { TagTypeEnum } from "models/TagTypeEnum";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { canCreateTags, canWriteTag, canWriteTags } from "../tagPermissions";

function BaseForm({ open }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const { values, errors, touched, handleBlur, setFieldValue } =
    useFormikContext();

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 0);
    }
  }, [open, inputRef]);

  const canWrite = values.new ? canCreateTags() : canWriteTag(values.tagType);

  // a navigation-only writer (WRITE_PATIENT_TAGS without WRITE_TAGS) may only
  // create navigation tags, so don't offer a type upsert_tag would reject.
  // Existing tags keep both options so the select can render its current label.
  const hidePatientOption = values.new && !canWriteTags();

  const tagTypeOptions = [
    ...(hidePatientOption
      ? []
      : [
          {
            value: TagTypeEnum.PATIENT,
            label: "Marcador do paciente",
          },
        ]),
    ...(PermissionService().has(Permission.READ_NAV)
      ? [
          {
            value: TagTypeEnum.PATIENT_NAVIGATION,
            label: "Marcador de navegação do paciente",
          },
        ]
      : []),
  ];

  return (
    <>
      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label">
          <label>Marcador:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("name", target.value)}
            value={values.name}
            ref={inputRef}
            style={{ width: "100%" }}
            disabled={!canWrite || !values.new}
          />
        </div>
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className={`form-row ${errors.tagType ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.tagType}
            onChange={(value) => setFieldValue("tagType", value)}
            allowClear
            options={tagTypeOptions}
            disabled={!canWrite || !values.new}
          />
        </div>
        {errors.tagType && <div className="form-error">{errors.tagType}</div>}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Ativo:</label>
        </div>
        <div className="form-input">
          <Switch
            checked={values.active}
            onChange={(value) => setFieldValue("active", value)}
            onBlur={handleBlur}
            status={errors.active && touched.active ? "error" : null}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
            disabled={!canWrite}
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
