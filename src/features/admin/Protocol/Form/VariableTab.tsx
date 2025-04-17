import React from "react";
import { useFormikContext } from "formik";
import { Divider } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { Input, Select } from "components/Inputs";
import Button from "components/Button";
import { IProtocolFormBaseFields } from "./ProtocolForm";
import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";

import { VariableContainer } from "../Protocol.style";

export function VariableTab() {
  const { values, errors, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

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

            {v.field === "exam" && (
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
            )}

            <div className={`form-row`}>
              <div className="form-label">
                <label>Operador:</label>
              </div>
              <div className="form-input">
                <Select
                  value={v.operator}
                  optionFilterProp="label"
                  options={ProtocolVariableFieldEnum.getOperators(v.field).map(
                    (f) => ({ value: f, label: f })
                  )}
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
