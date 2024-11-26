import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";

import { Select, Input } from "components/Inputs";
import IntegrationStatusTag from "components/IntegrationStatusTag";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const getExtraOptions = () => [
    {
      key: "1",
      label: "Fluxos de Atualização Central",
      children: (
        <>
          <p style={{ marginTop: 0 }}>
            Para mais informações sobre estes fluxos, consulte a Wiki.
          </p>
          <div
            className={`form-row ${errors.fl1 && touched.fl1 ? "error" : ""}`}
          >
            <div className="form-label">
              <label>FL1:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) => setFieldValue("fl1", value)}
                value={values.fl1}
                status={errors.fl1 && touched.fl1 ? "error" : null}
                optionFilterProp="children"
                showSearch
              >
                <Select.Option key={0} value={false}>
                  Desligado
                </Select.Option>
                <Select.Option key={1} value={true}>
                  Ligado
                </Select.Option>
              </Select>
            </div>
            <div className="form-info">
              Dispara o PresCalc para prescrições agregadas do cpoe que tenham
              sofrido alterações.
            </div>
            {errors.fl1 && touched.fl1 && (
              <div className="form-error">{errors.fl1}</div>
            )}
          </div>

          <div
            className={`form-row ${errors.fl2 && touched.fl2 ? "error" : ""}`}
          >
            <div className="form-label">
              <label>FL2:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) => setFieldValue("fl2", value)}
                value={values.fl2}
                status={errors.fl2 && touched.fl2 ? "error" : null}
                optionFilterProp="children"
                showSearch
              >
                <Select.Option key={0} value={false}>
                  Desligado
                </Select.Option>
                <Select.Option key={1} value={true}>
                  Ligado
                </Select.Option>
              </Select>
            </div>
            <div className="form-info">
              Dispara o PresCalc para prescrições individuais que tenham sofrido
              alterações.
            </div>
            {errors.fl2 && touched.fl2 && (
              <div className="form-error">{errors.fl1}</div>
            )}
          </div>

          <div
            className={`form-row ${errors.fl3 && touched.fl3 ? "error" : ""}`}
          >
            <div className="form-label">
              <label>FL3:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) => setFieldValue("fl3", value)}
                value={values.fl3}
                status={errors.fl3 && touched.fl3 ? "error" : null}
                optionFilterProp="children"
                showSearch
              >
                <Select.Option key={0} value={false}>
                  Desligado
                </Select.Option>
                <Select.Option key={1} value={true}>
                  Ligado
                </Select.Option>
              </Select>
            </div>
            <div className="form-info">
              Atualiza a tabela prescricaoagg com as prescrições do último ano
              presentes na NoHarm.
            </div>
            {errors.fl3 && touched.fl3 && (
              <div className="form-error">{errors.fl3}</div>
            )}
          </div>

          <div
            className={`form-row ${errors.fl4 && touched.fl4 ? "error" : ""}`}
          >
            <div className="form-label">
              <label>FL4:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) => setFieldValue("fl4", value)}
                value={values.fl4}
                status={errors.fl4 && touched.fl4 ? "error" : null}
                optionFilterProp="children"
                showSearch
              >
                <Select.Option key={0} value={false}>
                  Desligado
                </Select.Option>
                <Select.Option key={1} value={true}>
                  Ligado
                </Select.Option>
              </Select>
            </div>
            <div className="form-info">
              Cria prescrições de conciliação para os novos atendimentos que
              aparecem na tabela pessoa. Este fluxo deve ser usado para os
              hospitais que optarem por ter o fluxo onde existe somente uma
              conciliação por atendimento.
            </div>
            {errors.fl4 && touched.fl4 && (
              <div className="form-error">{errors.fl4}</div>
            )}
          </div>
        </>
      ),
    },
  ];

  const getGetnameOptions = () => [
    {
      key: "1",
      label: "Getname",
      children: (
        <>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Tipo:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) =>
                  setFieldValue("config.getname.type", value)
                }
                value={values.config?.getname?.type}
                optionFilterProp="children"
                showSearch
              >
                <Select.Option key={0} value={"default"}>
                  Getname NoHarm - Sem autenticação
                </Select.Option>
                <Select.Option key={1} value={"auth"}>
                  Getname NoHarm - Com autenticação
                </Select.Option>
                <Select.Option key={2} value={"proxy"}>
                  Proxy
                </Select.Option>
              </Select>
            </div>
          </div>

          {values.config?.getname?.type === "auth" && (
            <>
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Secret:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.config?.getname?.secret}
                    onChange={({ target }) =>
                      setFieldValue("config.getname.secret", target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {values.config?.getname?.type === "proxy" && (
            <>
              <div className={`form-row`}>
                <div className="form-label">
                  <label>URL resolução de nomes:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.config?.getname?.url}
                    onChange={({ target }) =>
                      setFieldValue("config.getname.url", target.value)
                    }
                  />
                </div>
              </div>

              <div className={`form-row`}>
                <div className="form-label">
                  <label>URL token:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.config?.getname?.token?.url}
                    onChange={({ target }) =>
                      setFieldValue("config.getname.token.url", target.value)
                    }
                  />
                </div>
              </div>

              <div className={`form-row`}>
                <div className="form-label">
                  <label>client_id:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.config?.getname?.token?.params?.client_id}
                    onChange={({ target }) =>
                      setFieldValue(
                        "config.getname.token.params.client_id",
                        target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className={`form-row`}>
                <div className="form-label">
                  <label>client_secret:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.config?.getname?.token?.params?.client_secret}
                    onChange={({ target }) =>
                      setFieldValue(
                        "config.getname.token.params.client_secret",
                        target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className={`form-row`}>
                <div className="form-label">
                  <label>grant_type:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.config?.getname?.token?.params?.grant_type}
                    onChange={({ target }) =>
                      setFieldValue(
                        "config.getname.token.params.grant_type",
                        target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className={`form-row`}>
                <div className="form-label">
                  <label>Parâmetros (json):</label>
                </div>
                <div className="form-input">
                  <Input
                    value={
                      typeof values.config?.getname?.params === "object"
                        ? JSON.stringify(values.config?.getname?.params)
                        : values.config?.getname?.params
                    }
                    onChange={({ target }) =>
                      setFieldValue("config.getname.params", target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div
        className={`form-row ${errors.status && touched.status ? "error" : ""}`}
      >
        <div className="form-label">
          <label>{t("labels.status")}:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("status", value)}
            value={values.status}
            status={errors.status && touched.status ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            <Select.Option key={0} value={0}>
              <IntegrationStatusTag status={0} />
            </Select.Option>
            <Select.Option key={1} value={1}>
              <IntegrationStatusTag status={1} />
            </Select.Option>
            <Select.Option key={2} value={2}>
              <IntegrationStatusTag status={2} />
            </Select.Option>
          </Select>
        </div>
        {errors.status && touched.status && (
          <div className="form-error">{errors.status}</div>
        )}
      </div>

      <div className={`form-row ${errors.cpoe && touched.cpoe ? "error" : ""}`}>
        <div className="form-label">
          <label>CPOE:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("cpoe", value)}
            value={values.cpoe}
            status={errors.cpoe && touched.cpoe ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            <Select.Option key={0} value={false}>
              Não
            </Select.Option>
            <Select.Option key={1} value={true}>
              Sim
            </Select.Option>
          </Select>
        </div>
        {errors.cpoe && touched.cpoe && (
          <div className="form-error">{errors.cpoe}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.nhCare && touched.nhCare ? "error" : ""}`}
      >
        <div className="form-label">
          <label>NoHarm Care:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("nhCare", value)}
            value={values.nhCare}
            status={errors.nhCare && touched.nhCare ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            <Select.Option key={0} value={0}>
              Desligado
            </Select.Option>
            <Select.Option key={1} value={1}>
              Processo legado
            </Select.Option>
            <Select.Option key={2} value={2}>
              Processo novo (mantém formatação original)
            </Select.Option>
          </Select>
        </div>
        {errors.nhCare && touched.nhCare && (
          <div className="form-error">{errors.nhCare}</div>
        )}
      </div>

      <Collapse
        accordion
        style={{ marginTop: "1rem" }}
        items={getExtraOptions()}
      ></Collapse>

      <Collapse
        accordion
        style={{ marginTop: "1rem" }}
        items={getGetnameOptions()}
      ></Collapse>
    </>
  );
}

export default BaseForm;
