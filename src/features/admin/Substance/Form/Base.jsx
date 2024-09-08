import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import Switch from "components/Switch";
import { Input } from "components/Inputs";
import Button from "components/Button";
import Editor from "components/Editor";
import Collapse from "components/Collapse";
import Dropdown from "components/Dropdown";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const handlingMenu = () => {
    const items = DrugAlertTypeEnum.getAlertTypes(t).map((a) => ({
      key: a.id,
      label: a.label,
    }));

    return {
      items,
      onClick: ({ key }) => {
        setFieldValue(`handling.${key}`, "");
      },
    };
  };

  const removeHandling = (key) => {
    const handling = { ...values.handling };

    delete handling[key];

    setFieldValue("handling", handling);
  };

  const handlingOptions = [
    {
      key: "1",
      label: "Manejo",
      children: (
        <>
          <Flex justify="flex-end">
            <Dropdown menu={handlingMenu()}>
              <Button icon={<PlusOutlined />}>Adicionar manejo</Button>
            </Dropdown>
          </Flex>
          {values.handling &&
            Object.keys(values.handling).map((k) => (
              <div className={`form-row`}>
                <div className="form-label">
                  <label>{t(`drugAlertType.${k}`)}:</label>
                </div>
                <div className="form-input">
                  <Editor
                    onEdit={(text) => setFieldValue(`handling.${k}`, text)}
                    content={values.handling[k] || ""}
                  />
                  <Button onClick={() => removeHandling(k)}>Remover</Button>
                </div>
              </div>
            ))}
        </>
      ),
    },
  ];

  return (
    <>
      <div className={`form-row ${errors.id && touched.id ? "error" : ""}`}>
        <div className="form-label">
          <label>SCTID:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ evt }) => setFieldValue("id", evt.target.value)}
            value={values.id}
            disabled={!values.new}
          />
        </div>
        {errors.id && touched.id && (
          <div className="form-error">{errors.id}</div>
        )}
      </div>
      <div className={`form-row ${errors.link && touched.link ? "error" : ""}`}>
        <div className="form-label">
          <label>Link bulário:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ evt }) => setFieldValue("link", evt.target.value)}
            value={values.link}
          />
        </div>
        {errors.link && touched.link && (
          <div className="form-error">{errors.link}</div>
        )}
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
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.active && touched.active && (
          <div className="form-error">{errors.active}</div>
        )}
      </div>
      <div className={`form-row`}>
        <Collapse items={handlingOptions} />
      </div>
    </>
  );
}

export default BaseForm;
