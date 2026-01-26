import React, { useState } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Tabs, Flex } from "antd";

import { Select, Input, Textarea } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import api from "services/api";
import IntegrationStatusTag from "components/IntegrationStatusTag";
import { TpPepEnum } from "src/models/TpPepEnum";

function BaseForm() {
  const { t } = useTranslation();
  const [generatingToken, setGeneratingToken] = useState();
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const generateToken = async () => {
    setGeneratingToken(true);
    const response = await api.getGetnameToken();

    DefaultModal.info({
      title: "Getname Token",
      content: response.data?.data,
      icon: null,
      width: 550,
      okText: "Fechar",
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
      mask: { blur: false },
    });

    setGeneratingToken(false);
  };

  const setJsonValue = (field, value) => {
    try {
      setFieldValue(field, JSON.parse(value));
    } catch {
      setFieldValue(field, "invalid json");
    }
  };

  const renderGetnameTab = () => (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>Tipo:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("config.getname.type", value)}
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
              <Flex>
                <Input
                  value={values.config?.getname?.secret}
                  onChange={({ target }) =>
                    setFieldValue("config.getname.secret", target.value)
                  }
                />
                <Tooltip
                  title={
                    values.schema !== localStorage.getItem("schema")
                      ? "Para gerar o token você precisa fazer login no schema que está sendo configurado"
                      : "Gerar token para teste (válido por 2min). Obs: salve o secret antes de gerar o token."
                  }
                >
                  <Button
                    style={{ marginLeft: "5px" }}
                    onClick={generateToken}
                    loading={generatingToken}
                    disabled={values.schema !== localStorage.getItem("schema")}
                  >
                    Gerar token
                  </Button>
                </Tooltip>
              </Flex>
            </div>
          </div>
        </>
      )}

      {values.config?.getname?.type === "proxy" && (
        <>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Usa o getname NoHarm?</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) =>
                  setFieldValue("config.getname.internal", value)
                }
                value={values.config?.getname?.internal}
                optionFilterProp="children"
                showSearch
              >
                <Select.Option key={0} value={true}>
                  Sim
                </Select.Option>
                <Select.Option key={1} value={false}>
                  Não
                </Select.Option>
              </Select>
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>URL resolução de nomes (development):</label>
            </div>
            <div className="form-input">
              <Input
                value={values.config?.getname?.urlDev}
                onChange={({ target }) =>
                  setFieldValue("config.getname.urlDev", target.value)
                }
              />
            </div>
          </div>

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
              <label>Parâmetros Token (JSON):</label>
            </div>
            <div className="form-input">
              <Textarea
                value={
                  typeof values.config?.getname?.token?.params === "object"
                    ? JSON.stringify(values.config?.getname?.token?.params)
                    : values.config?.getname?.token?.params
                }
                onChange={({ target }) =>
                  setFieldValue("config.getname.token.params", target.value)
                }
                onBlur={({ target }) =>
                  setJsonValue("config.getname.token.params", target.value)
                }
              />
            </div>
            {errors.config?.getname?.token?.params && (
              <div className="form-error">
                {errors.config?.getname?.token?.params}
              </div>
            )}
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Prefixo header authorization:</label>
            </div>
            <div className="form-input">
              <Input
                value={values.config?.getname?.authPrefix}
                onChange={({ target }) =>
                  setFieldValue("config.getname.authPrefix", target.value)
                }
              />
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Parâmetros (JSON):</label>
            </div>
            <div className="form-input">
              <Textarea
                value={
                  typeof values.config?.getname?.params === "object"
                    ? JSON.stringify(values.config?.getname?.params)
                    : values.config?.getname?.params
                }
                onChange={({ target }) =>
                  setFieldValue("config.getname.params", target.value)
                }
                onBlur={({ target }) =>
                  setJsonValue("config.getname.params", target.value)
                }
              />
            </div>
            {errors.config?.getname?.params && (
              <div className="form-error">{errors.config?.getname?.params}</div>
            )}
          </div>
        </>
      )}
    </>
  );

  const renderNifiRemotoTab = () => (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>Schema principal:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.config?.remotenifi?.main}
            onChange={({ target }) =>
              setFieldValue("config.remotenifi.main", target.value)
            }
          />
        </div>
        <div className="form-info">
          Em casos de múltiplas integrações no mesmo nifi, indique aqui o schema
          principal.
        </div>
      </div>
    </>
  );

  const renderOdooTab = () => (
    <>
      {values.crm_data ? (
        <>
          {Object.entries(values.crm_data).map(([key, value]) => (
            <div key={key} className="form-row">
              <div className="form-label">
                <label>{t(`crm_data.${key}`)}:</label>
              </div>
              <div className="form-input">
                <Input
                  value={
                    typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)
                  }
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="form-row">
          <div className="form-info">Nenhum dado CRM disponível.</div>
        </div>
      )}
    </>
  );

  const renderConfiguracaoTab = () => (
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

      <div
        className={`form-row ${errors.tp_pep && touched.tp_pep ? "error" : ""}`}
      >
        <div className="form-label">
          <label>PEP:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("tp_pep", value)}
            value={values.tp_pep}
            status={errors.tp_pep && touched.tp_pep ? "error" : null}
            showSearch={{
              optionFilterProp: ["label"],
            }}
            options={TpPepEnum.getList()}
          />
        </div>
        {errors.status && touched.status && (
          <div className="form-error">{errors.status}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.tpPrescalc && touched.tpPrescalc ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>PRESCALC:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("tpPrescalc", value)}
            value={values.tpPrescalc}
            status={errors.tpPrescalc && touched.tpPrescalc ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            <Select.Option key={0} value={0}>
              Desligado
            </Select.Option>
            <Select.Option key={1} value={1}>
              Ligado (Produção)
            </Select.Option>
            <Select.Option key={2} value={2}>
              Ligado (Homologação)
            </Select.Option>
          </Select>
        </div>
        {errors.tpPrescalc && touched.tpPrescalc && (
          <div className="form-error">{errors.tpPrescalc}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.returnIntegration && touched.returnIntegration ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Integração de Retorno:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("returnIntegration", value)}
            value={values.returnIntegration}
            status={
              errors.returnIntegration && touched.returnIntegration
                ? "error"
                : null
            }
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
        <div className="form-info">
          Quando ativado, a aplicação exigirá a presença do valor fkusuario para
          checar prescrições e criar novas evoluções.
        </div>
        {errors.returnIntegration && touched.returnIntegration && (
          <div className="form-error">{errors.returnIntegration}</div>
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
    </>
  );

  const tabItems = [
    {
      key: "1",
      label: "Configuração",
      children: renderConfiguracaoTab(),
    },
    {
      key: "2",
      label: "Getname",
      children: renderGetnameTab(),
    },
    {
      key: "3",
      label: "Nifi remoto",
      children: renderNifiRemotoTab(),
    },
    {
      key: "4",
      label: "Odoo",
      children: renderOdooTab(),
    },
  ];

  return (
    <Tabs defaultActiveKey="1" items={tabItems} style={{ marginTop: "1rem" }} />
  );
}

export default BaseForm;
