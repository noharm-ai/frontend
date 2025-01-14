import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Flex, Tabs, Row, Col, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import Switch from "components/Switch";
import { Input, Select, InputNumber } from "components/Inputs";
import Button from "components/Button";
import Editor from "components/Editor";
import Dropdown from "components/Dropdown";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import { formatDateTime } from "utils/date";

function BaseForm() {
  const { t } = useTranslation();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
  const { values, errors, touched, setFieldValue } = useFormikContext();
  const maxValue = 999999999;

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

                <Divider />

                <div
                  className={`form-row ${
                    errors.id && touched.id ? "error" : ""
                  }`}
                >
                  <div className="form-label">
                    <label>Atualização:</label>
                  </div>
                  <div className="form-input">
                    {values.responsible ? (
                      <>
                        {values.responsible} em{" "}
                        {formatDateTime(values.updatedAt)}
                      </>
                    ) : (
                      "--"
                    )}
                  </div>
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
          {
            key: "admin-text",
            label: "Curadoria",
            children: (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Unidade padrão:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      optionFilterProp="children"
                      showSearch
                      value={values.defaultMeasureUnit}
                      onChange={(value) =>
                        setFieldValue("defaultMeasureUnit", value)
                      }
                      allowClear
                    >
                      <Select.Option value={"mg"}>mg</Select.Option>
                      <Select.Option value={"ml"}>ml</Select.Option>

                      <Select.Option value={"mcg"}>mcg</Select.Option>
                      <Select.Option value={"UI"}>UI</Select.Option>
                    </Select>
                  </div>
                </div>

                <Row gutter={[16, 8]} style={{ marginTop: "10px" }}>
                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Dose máxima adulto:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.maxdoseAdult}
                          onChange={(value) =>
                            setFieldValue("maxdoseAdult", value)
                          }
                          status={
                            errors.maxdoseAdult && touched.maxdoseAdult
                              ? "error"
                              : null
                          }
                          addonAfter={values.defaultMeasureUnit || "--"}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Dose máxima adulto por peso:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.maxdoseAdultWeight}
                          onChange={(value) =>
                            setFieldValue("maxdoseAdultWeight", value)
                          }
                          status={
                            errors.maxdoseAdultWeight &&
                            touched.maxdoseAdultWeight
                              ? "error"
                              : null
                          }
                          addonAfter={`${values.defaultMeasureUnit || "--"}/Kg`}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Dose máxima pediátrico:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.maxdosePediatric}
                          onChange={(value) =>
                            setFieldValue("maxdosePediatric", value)
                          }
                          status={
                            errors.maxdosePediatric && touched.maxdosePediatric
                              ? "error"
                              : null
                          }
                          addonAfter={values.defaultMeasureUnit || "--"}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Dose máxima pediátrico por peso:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.maxdosePediatricWeight}
                          onChange={(value) =>
                            setFieldValue("maxdosePediatricWeight", value)
                          }
                          status={
                            errors.maxdosePediatricWeight &&
                            touched.maxdosePediatricWeight
                              ? "error"
                              : null
                          }
                          addonAfter={`${values.defaultMeasureUnit || "--"}/Kg`}
                        />{" "}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Texto curadoria:</label>
                  </div>
                  <div className="form-input">
                    <Editor
                      onEdit={(text) => setFieldValue(`adminText`, text)}
                      content={values.adminText || ""}
                    />
                  </div>
                </div>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export default BaseForm;
