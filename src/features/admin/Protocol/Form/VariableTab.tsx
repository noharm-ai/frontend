import React from "react";
import { useFormikContext } from "formik";
import { Divider } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { Input, Select } from "components/Inputs";
import Button from "components/Button";
import { IProtocolFormBaseFields } from "./ProtocolForm";
import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";
import clinicalNotesIndicator from "src/components/Screening/ClinicalNotes/ClinicalNotesIndicator";

import { VariableContainer } from "../Protocol.style";

export function VariableTab() {
  const { values, errors, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();
  const { t } = useTranslation();

  const setConfig = (idx: number, field: string, value: any) => {
    const variables = JSON.parse(JSON.stringify(values.config.variables));

    variables[idx][field] = value;

    if (field === "field") {
      variables[idx]["operator"] = null;
      variables[idx]["value"] = null;
    }

    setFieldValue("config.variables", variables);
  };

  const addVariable = () => {
    if (!values.config?.variables) {
      setFieldValue("config.variables", [{ name: "var_1" }]);
      return;
    }

    setFieldValue("config.variables", [
      ...values.config.variables,
      { name: `var_${values.config.variables.length + 1}` },
    ]);
  };

  const removeVariable = (varName: string) => {
    setFieldValue(
      "config.variables",
      (values.config.variables ?? []).filter((v: any) => v.name !== varName)
    );
  };

  return (
    <>
      {(values.config?.variables ?? []).map((v: any, idx: number) => (
        <React.Fragment key={v.name}>
          <VariableContainer>
            <div className={`form-row`}>
              <div className="form-label">
                <label>Nome da variável:</label>
              </div>
              <div className="form-input">
                <Input
                  value={v.name}
                  disabled
                  onChange={({ target }) =>
                    setConfig(idx, "name", target.value)
                  }
                />
              </div>
            </div>

            <div className={`form-row`}>
              <div className="form-label">
                <label>Tipo:</label>
              </div>
              <div className="form-input">
                <Select
                  value={v.field}
                  optionFilterProp="label"
                  options={ProtocolVariableFieldEnum.getList()}
                  onChange={(value) => setConfig(idx, "field", value)}
                />
              </div>
            </div>

            {v.field === "cn_stats" && (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Indicador NoHarm Care:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.statsType}
                      optionFilterProp="label"
                      options={clinicalNotesIndicator.listSelectOptions(t)}
                      onChange={(value) => setConfig(idx, "statsType", value)}
                    />
                  </div>
                </div>
              </>
            )}

            {v.field === "exam" && (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Exame (tp_exame):</label>
                  </div>
                  <div className="form-input">
                    <Input
                      value={v.examType}
                      onChange={({ target }) =>
                        setConfig(idx, "examType", target.value)
                      }
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Qtd. máxima de dias desde o último exame:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      value={v.examPeriod}
                      onChange={({ target }) =>
                        setConfig(idx, "examPeriod", target.value)
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {v.field === ProtocolVariableFieldEnum.COMBINATION ? (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Substância (sctid):</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.substance}
                      allowClear
                      mode="tags"
                      onChange={(value) => setConfig(idx, "substance", value)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Classe (idclasse):</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.class}
                      allowClear
                      mode="tags"
                      onChange={(value) => setConfig(idx, "class", value)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Medicamento (fkmedicamento):</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.drug}
                      allowClear
                      mode="tags"
                      onChange={(value) => setConfig(idx, "drug", value)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Via:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.route}
                      allowClear
                      mode="tags"
                      onChange={(value) => setConfig(idx, "route", value)}
                    />
                  </div>
                </div>

                <div className={`form-row form-row-flex`}>
                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Dose (operador):</label>
                    </div>
                    <div className="form-input">
                      <Select
                        allowClear
                        value={v.doseOperator}
                        optionFilterProp="label"
                        options={ProtocolVariableFieldEnum.getOperators(
                          ProtocolVariableFieldEnum.AGE
                        ).map((f) => ({ value: f, label: f }))}
                        onChange={(value) =>
                          setConfig(idx, "doseOperator", value)
                        }
                      />
                    </div>
                  </div>

                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Dose (valor):</label>
                    </div>
                    <div className="form-input">
                      <Input
                        value={v.dose}
                        onChange={({ target }) =>
                          setConfig(idx, "dose", target.value)
                        }
                      />
                    </div>
                    <div className="form-info">
                      Informar a dose na unidade padrão do medicamento
                    </div>
                  </div>
                </div>

                <div className={`form-row form-row-flex`}>
                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Frequência-dia (operador):</label>
                    </div>
                    <div className="form-input">
                      <Select
                        allowClear
                        value={v.frequencydayOperator}
                        optionFilterProp="label"
                        options={ProtocolVariableFieldEnum.getOperators(
                          ProtocolVariableFieldEnum.AGE
                        ).map((f) => ({ value: f, label: f }))}
                        onChange={(value) =>
                          setConfig(idx, "frequencydayOperator", value)
                        }
                      />
                    </div>
                  </div>

                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Frequência-dia (valor):</label>
                    </div>
                    <div className="form-input">
                      <Input
                        value={v.frequencyday}
                        onChange={({ target }) =>
                          setConfig(idx, "frequencyday", target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className={`form-row form-row-flex`}>
                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Período (operador):</label>
                    </div>
                    <div className="form-input">
                      <Select
                        allowClear
                        value={v.periodOperator}
                        optionFilterProp="label"
                        options={ProtocolVariableFieldEnum.getOperators(
                          ProtocolVariableFieldEnum.AGE
                        ).map((f) => ({ value: f, label: f }))}
                        onChange={(value) =>
                          setConfig(idx, "periodOperator", value)
                        }
                      />
                    </div>
                  </div>

                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Período (valor):</label>
                    </div>
                    <div className="form-input">
                      <Input
                        value={v.period}
                        onChange={({ target }) =>
                          setConfig(idx, "period", target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Observação:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      value={v.observation}
                      onChange={({ target }) =>
                        setConfig(idx, "observation", target.value)
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Operador:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.operator}
                      optionFilterProp="label"
                      options={ProtocolVariableFieldEnum.getOperators(
                        v.field
                      ).map((f) => ({ value: f, label: f }))}
                      onChange={(value) => setConfig(idx, "operator", value)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Valor:</label>
                  </div>
                  <div className="form-input">
                    {v.operator === "IN" || v.operator === "NOTIN" ? (
                      <Select
                        value={v.value}
                        mode="tags"
                        onChange={(value) => setConfig(idx, "value", value)}
                      />
                    ) : (
                      <Input
                        value={v.value}
                        onChange={({ target }) =>
                          setConfig(idx, "value", target.value)
                        }
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="form-row">
              <Button
                block
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeVariable(v.name)}
              >
                Remover Variável
              </Button>
            </div>
          </VariableContainer>
          <Divider />
        </React.Fragment>
      ))}
      <Button
        block
        icon={<PlusOutlined />}
        onClick={addVariable}
        type="primary"
      >
        Adicionar Variável
      </Button>
      {errors.config?.variables && (
        <div className="form-error">{errors.config?.variables}</div>
      )}
    </>
  );
}
