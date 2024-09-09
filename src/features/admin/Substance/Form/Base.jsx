import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Flex, Tabs } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import Switch from "components/Switch";
import { Input, Select } from "components/Inputs";
import Button from "components/Button";
import Editor from "components/Editor";
import Dropdown from "components/Dropdown";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

function BaseForm() {
  const { t } = useTranslation();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
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

  return (
    <>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: "Geral",
            key: "general",
            children: (
              <>
                <div
                  className={`form-row ${
                    errors.id && touched.id ? "error" : ""
                  }`}
                >
                  <div className="form-label">
                    <label>SCTID:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      onChange={({ target }) =>
                        setFieldValue("id", target.value)
                      }
                      value={values.id}
                      disabled={!values.new}
                    />
                  </div>
                  {errors.id && touched.id && (
                    <div className="form-error">{errors.id}</div>
                  )}
                </div>
                <div
                  className={`form-row ${
                    errors.name && touched.name ? "error" : ""
                  }`}
                >
                  <div className="form-label">
                    <label>Nome:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      onChange={({ target }) =>
                        setFieldValue("name", target.value)
                      }
                      value={values.name}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <div className="form-error">{errors.name}</div>
                  )}
                </div>
                <div
                  className={`form-row ${
                    errors.idClass && touched.idClass ? "error" : ""
                  }`}
                >
                  <div className="form-label">
                    <label>Classe:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      optionFilterProp="children"
                      showSearch
                      style={{ width: "100%" }}
                      value={values.idClass}
                      onChange={(value, option) =>
                        setFieldValue("idClass", value)
                      }
                      allowClear
                    >
                      {substanceClasses.map(({ id, name }) => (
                        <Select.Option key={id} value={id}>
                          {name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  {errors.idClass && touched.idClass && (
                    <div className="form-error">{errors.idClass}</div>
                  )}
                </div>
                <div
                  className={`form-row ${
                    errors.link && touched.link ? "error" : ""
                  }`}
                >
                  <div className="form-label">
                    <label>Link bulário:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      onChange={({ target }) =>
                        setFieldValue("link", target.value)
                      }
                      value={values.link}
                    />
                  </div>
                  {errors.link && touched.link && (
                    <div className="form-error">{errors.link}</div>
                  )}
                </div>
                <div
                  className={`form-row ${
                    errors.active && touched.active ? "error" : ""
                  }`}
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
              </>
            ),
          },
          {
            key: "handling",
            label: "Manejo",
            children: (
              <>
                {values.handling &&
                  Object.keys(values.handling).map((k) => (
                    <div className={`form-row`} key={k}>
                      <div className="form-label">
                        <Flex justify="space-between" align="center">
                          <div>
                            <label>{t(`drugAlertType.${k}`)}:</label>
                          </div>
                          <Button
                            onClick={() => removeHandling(k)}
                            danger
                            icon={<DeleteOutlined />}
                            style={{ marginBottom: "5px" }}
                            size="small"
                          ></Button>
                        </Flex>
                      </div>
                      <div className="form-input">
                        <Editor
                          onEdit={(text) =>
                            setFieldValue(`handling.${k}`, text)
                          }
                          content={values.handling[k] || ""}
                        />
                      </div>
                    </div>
                  ))}
                <Flex justify="center" style={{ marginTop: "20px" }}>
                  <Dropdown menu={handlingMenu()}>
                    <Button icon={<PlusOutlined />}>Adicionar manejo</Button>
                  </Dropdown>
                </Flex>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export default BaseForm;
