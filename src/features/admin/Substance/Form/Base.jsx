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
import { tagRender } from "components/Tag";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import { formatDateTime } from "utils/date";
import { SubstanceTagEnum } from "models/SubstanceTagEnum";

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
                      onChange={(value) => setFieldValue("idClass", value)}
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
                          utilities={["basic", "link"]}
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
                    <label>Tags:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      optionFilterProp="children"
                      showSearch
                      value={values.tags}
                      onChange={(value) => setFieldValue("tags", value)}
                      allowClear
                      mode="multiple"
                      tagRender={tagRender("purple")}
                    >
                      {SubstanceTagEnum.getSubstanceTags(t).map((subtag) => (
                        <Select.Option value={subtag.id} key={subtag.id}>
                          {subtag.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>

                <Divider orientation="left" style={{ marginTop: "25px" }}>
                  Dose Máxima
                </Divider>

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

                <Row gutter={[24, 16]} style={{ marginTop: "16px" }}>
                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Dose máxima (Adulto):</label>
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
                        <label>Dose máxima por peso (Adulto):</label>
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
                        <label>Dose máxima (Pediátrico):</label>
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
                        <label>Dose máxima por peso (Pediátrico):</label>
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

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Divisor de faixas:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.divisionRange}
                          onChange={(value) =>
                            setFieldValue("divisionRange", value)
                          }
                          addonAfter={`${values.defaultMeasureUnit || "--"}`}
                        />{" "}
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider orientation="left" style={{ marginTop: "25px" }}>
                  Alertas
                </Divider>

                <Row gutter={[24, 16]} style={{ marginTop: "16px" }}>
                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Nefrotóxico (Adulto):</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.kidneyAdult}
                          onChange={(value) =>
                            setFieldValue("kidneyAdult", value)
                          }
                          addonAfter={`mL/min`}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Nefrotóxico (Pediátrico):</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.kidneyPediatric}
                          onChange={(value) =>
                            setFieldValue("kidneyPediatric", value)
                          }
                          addonAfter={`mL/min`}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Hepatotóxico (Adulto):</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.liverAdult}
                          onChange={(value) =>
                            setFieldValue("liverAdult", value)
                          }
                          addonAfter={`U/L`}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Hepatotóxico (Pediátrico):</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.liverPediatric}
                          onChange={(value) =>
                            setFieldValue("liverPediatric", value)
                          }
                          addonAfter={`U/L`}
                        />{" "}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Alerta de plaquetas:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={0}
                          max={maxValue}
                          value={values.platelets}
                          onChange={(value) =>
                            setFieldValue("platelets", value)
                          }
                          addonAfter={`plaquetas/µL`}
                        />{" "}
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider orientation="left" style={{ marginTop: "25px" }}>
                  Riscos
                </Divider>

                <Row gutter={[16, 8]} style={{ marginTop: "10px" }}>
                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Risco de queda:</label>
                      </div>
                      <div className="form-input">
                        <InputNumber
                          min={1}
                          max={3}
                          value={values.fallRisk}
                          onChange={(value) => setFieldValue("fallRisk", value)}
                        />
                      </div>
                      <div className="form-info">Valor entre 1 e 3</div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Risco na lactação:</label>
                      </div>
                      <div className="form-input">
                        <Select
                          placeholder="Selecione a classificação"
                          onChange={(value) => {
                            setFieldValue("lactating", value || null);
                          }}
                          value={values.lactating}
                          allowClear
                          style={{ maxWidth: "300px" }}
                        >
                          <Select.Option value="1" key="1">
                            Baixo
                          </Select.Option>
                          <Select.Option value="2" key="2">
                            Médio
                          </Select.Option>
                          <Select.Option value="3" key="3">
                            Alto
                          </Select.Option>
                        </Select>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className={`form-row`}>
                      <div className="form-label">
                        <label>Risco na gestação:</label>
                      </div>
                      <div className="form-input">
                        <Select
                          placeholder="Selecione a classificação"
                          onChange={(value) => {
                            setFieldValue("pregnant", value || null);
                          }}
                          value={values.pregnant}
                          allowClear
                          style={{ maxWidth: "300px" }}
                        >
                          <Select.Option value="A" key="A">
                            A
                          </Select.Option>
                          <Select.Option value="B" key="B">
                            B
                          </Select.Option>
                          <Select.Option value="C" key="C">
                            C
                          </Select.Option>
                          <Select.Option value="D" key="D">
                            D
                          </Select.Option>
                          <Select.Option value="X" key="X">
                            X
                          </Select.Option>
                        </Select>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider style={{ marginTop: "25px" }} />

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Texto curadoria:</label>
                  </div>
                  <div className="form-input">
                    <Editor
                      onEdit={(text) => setFieldValue(`adminText`, text)}
                      content={values.adminText || ""}
                      utilities={["basic", "link"]}
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
