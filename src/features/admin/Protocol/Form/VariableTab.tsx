import { useFormikContext } from "formik";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { Input, Select, Radio } from "components/Inputs";
import Button from "components/Button";
import { IProtocolFormBaseFields } from "./types";
import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";
import clinicalNotesIndicator from "src/components/Screening/ClinicalNotes/ClinicalNotesIndicator";
import { ProtocolSubstanceClassSelect } from "./ProtocolSubstanceClassSelect/ProtocolSubstanceClassSelect";
import { ProtocolSubstanceSelect } from "./ProtocolSubstanceSelect/ProtocolSubstanceSelect";
import { ProtocolDrugSelect } from "./ProtocolDrugSelect/ProtocolDrugSelect";
import { ProtocolExamSelect } from "./ProtocolExamSelect/ProtocolExamSelect";
import { ProtocolExamRefSelect } from "./ProtocolExamRefSelect/ProtocolExamRefSelect";
import { ProtocolDepartmentSelect } from "./ProtocolDepartmentSelect/ProtocolDepartmentSelect";
import { ProtocolSegmentSelect } from "./ProtocolSegmentSelect/ProtocolSegmentSelect";
import { ProtocolIcdSelect } from "./ProtocolIcdSelect/ProtocolIcdSelect";
import { ProtocolRouteSelect } from "./ProtocolRouteSelect/ProtocolRouteSelect";

import { VariableContainer, VariableGrid } from "../Protocol.style";

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
      (values.config.variables ?? []).filter((v: any) => v.name !== varName),
    );
  };

  const yesNoOptions = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
    { label: "Não se aplica", value: null },
  ];

  const getFieldOptions = (field: string) => {
    switch (field) {
      case ProtocolVariableFieldEnum.SEGMENT_TYPE:
        return [
          { value: 1, label: "ADULTO" },
          { value: 2, label: "PEDIÁTRICO" },
        ];

      default:
        return [];
    }
  };

  const fieldDescriptions: Record<string, string> = {
    [ProtocolVariableFieldEnum.SUBSTANCE]:
      "Verifica se a lista de substâncias (sctid) dos itens prescritos contém (IN) ou não contém (NOTIN) alguma das substâncias informadas.",
    [ProtocolVariableFieldEnum.ID_DRUG]:
      "Verifica se algum dos medicamentos prescritos (fkmedicamento) está (IN) ou não está (NOTIN) na lista informada.",
    [ProtocolVariableFieldEnum.DRUG_CLASS]:
      "Verifica se a classe dos medicamentos prescritos está (IN) ou não está (NOTIN) na lista informada.",
    [ProtocolVariableFieldEnum.ROUTE]:
      "Verifica se alguma das vias dos itens prescritos está (IN) ou não está (NOTIN) na lista informada. A comparação ignora maiúsculas/minúsculas.",
    [ProtocolVariableFieldEnum.EXAM]:
      "Compara o valor do último resultado do exame selecionado com o valor informado. Opcionalmente, ignora o exame se ele for mais antigo que a quantidade de dias informada.",
    [ProtocolVariableFieldEnum.EXAM_REF]:
      "Igual ao Exame, mas usa o resultado mais recente agrupado pelo exame de referência padrão NoHarm (tp_exam_ref).",
    [ProtocolVariableFieldEnum.AGE]:
      "Compara a idade do paciente (em anos) com o valor informado.",
    [ProtocolVariableFieldEnum.WEIGHT]:
      "Compara o peso do paciente (em kg) com o valor informado.",
    [ProtocolVariableFieldEnum.ID_DEPARTMENT]:
      "Verifica se o setor (fksetor) da prescrição está (IN) ou não está (NOTIN) na lista informada.",
    [ProtocolVariableFieldEnum.ID_SEGMENT]:
      "Verifica se o segmento (idsegmento) da prescrição está (IN) ou não está (NOTIN) na lista informada.",
    [ProtocolVariableFieldEnum.COMBINATION]:
      "Verifica se existe ao menos um item prescrito que atenda simultaneamente a todos os critérios preenchidos abaixo (substância, classe, medicamento, dose, frequência, via, etc.). Os itens que baterem serão vinculados ao protocolo.",
    [ProtocolVariableFieldEnum.ADMISSION_TIME]:
      "Compara o tempo de internação do paciente (em horas, desde a data de admissão) com o valor informado.",
    [ProtocolVariableFieldEnum.ST_CONCILIA]:
      "Compara o status de conciliação do paciente (0 = não possui, 1 = possui) com o valor informado.",
    [ProtocolVariableFieldEnum.CN_STATS]:
      "Compara o valor do indicador NoHarm Care selecionado com o valor informado.",
    [ProtocolVariableFieldEnum.ID_ICD]:
      "Verifica se o CID (id_cid) do paciente está (IN) ou não está (NOTIN) na lista informada. Só funciona com os operadores IN/NOTIN.",
    [ProtocolVariableFieldEnum.DISCHARGE_REASON]:
      "Verifica se o motivo de alta do paciente contém o texto informado (comparação parcial, ignora maiúsculas/minúsculas).",
    [ProtocolVariableFieldEnum.SEGMENT_TYPE]:
      "Compara o tipo de segmento (ADULTO ou PEDIÁTRICO) com o valor informado.",
    [ProtocolVariableFieldEnum.INSURANCE]:
      "Verifica se o convênio da prescrição contém o texto informado (comparação parcial, ignora maiúsculas/minúsculas).",
  };

  return (
    <>
      <VariableGrid>
        {(values.config?.variables ?? []).map((v: any, idx: number) => (
          <VariableContainer key={v.name}>
            <div className="variable-header">
              <h4 className="variable-title">{v.name}</h4>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeVariable(v.name)}
                title="Remover Variável"
              />
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
                {v.field && fieldDescriptions[v.field] && (
                  <div className="form-info">{fieldDescriptions[v.field]}</div>
                )}
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
                    <ProtocolExamSelect
                      value={v.examType}
                      onChange={(examType) =>
                        setConfig(idx, "examType", examType)
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

            {v.field === ProtocolVariableFieldEnum.EXAM_REF && (
              <>
                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Exame (tp_exame):</label>
                  </div>
                  <div className="form-input">
                    <ProtocolExamRefSelect
                      value={v.examRefType}
                      onChange={(examRefType) =>
                        setConfig(idx, "examRefType", examRefType)
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
                      value={v.examRefPeriod}
                      onChange={({ target }) =>
                        setConfig(idx, "examRefPeriod", target.value)
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
                    <label>Substância:</label>
                  </div>
                  <div className="form-input">
                    <ProtocolSubstanceSelect
                      value={v.substance}
                      onChange={(ids) => setConfig(idx, "substance", ids)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Classe:</label>
                  </div>
                  <div className="form-input">
                    <ProtocolSubstanceClassSelect
                      value={v.class}
                      onChange={(ids) => setConfig(idx, "class", ids)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Medicamento:</label>
                  </div>
                  <div className="form-input">
                    <ProtocolDrugSelect
                      value={v.drug}
                      onChange={(ids) => setConfig(idx, "drug", ids)}
                    />
                  </div>
                </div>

                <div className={`form-row`}>
                  <div className="form-label">
                    <label>Atributo do medicamento:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      value={v.drugAttribute}
                      allowClear
                      mode="multiple"
                      optionFilterProp="label"
                      options={[
                        { value: "mav", label: "Alta Vigilância" },
                        { value: "antimicro", label: "Antimicrobiano" },
                        { value: "controlled", label: "Controlado" },
                        { value: "dialyzable", label: "Dializavel" },
                        { value: "elderly", label: "Inapropriado para idosos" },
                        { value: "notdefault", label: "Não Padronizado" },
                        { value: "chemo", label: "Quimioterápico" },
                      ]}
                      onChange={(value) =>
                        setConfig(idx, "drugAttribute", value)
                      }
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
                      <label>Via intravenosa?:</label>
                    </div>
                    <div className="form-input">
                      <Radio.Group
                        options={yesNoOptions}
                        optionType="button"
                        onChange={({ target: { value } }: any) =>
                          setConfig(idx, "intravenous", value)
                        }
                        value={v.intravenous}
                      />
                    </div>
                  </div>
                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Via sonda?:</label>
                    </div>
                    <div className="form-input">
                      <Radio.Group
                        options={yesNoOptions}
                        optionType="button"
                        onChange={({ target: { value } }: any) =>
                          setConfig(idx, "feedingTube", value)
                        }
                        value={v.feedingTube}
                      />
                    </div>
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
                          ProtocolVariableFieldEnum.AGE,
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
                  <div className={`form-row`}></div>

                  <div className={`form-row`}>
                    <div className="form-label">
                      <label>Unidade de medida padrão:</label>
                    </div>
                    <div className="form-input">
                      <Select
                        optionFilterProp="children"
                        showSearch
                        value={v.defaultMeasureUnit}
                        onChange={(value) =>
                          setConfig(idx, "defaultMeasureUnit", value)
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
                          ProtocolVariableFieldEnum.AGE,
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
                          ProtocolVariableFieldEnum.AGE,
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
                        v.field,
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
                    {v.field === ProtocolVariableFieldEnum.DRUG_CLASS ? (
                      <ProtocolSubstanceClassSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.field === ProtocolVariableFieldEnum.SUBSTANCE ? (
                      <ProtocolSubstanceSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.field === ProtocolVariableFieldEnum.ID_DRUG ? (
                      <ProtocolDrugSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.field === ProtocolVariableFieldEnum.ID_DEPARTMENT ? (
                      <ProtocolDepartmentSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.field === ProtocolVariableFieldEnum.ID_SEGMENT ? (
                      <ProtocolSegmentSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.field === ProtocolVariableFieldEnum.ID_ICD ? (
                      <ProtocolIcdSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.field === ProtocolVariableFieldEnum.ROUTE ? (
                      <ProtocolRouteSelect
                        value={v.value}
                        onChange={(ids) => setConfig(idx, "value", ids)}
                      />
                    ) : v.operator === "IN" || v.operator === "NOTIN" ? (
                      <Select
                        value={v.value}
                        mode="tags"
                        onChange={(value) => setConfig(idx, "value", value)}
                        options={getFieldOptions(v.field)}
                      />
                    ) : (
                      <Input
                        value={v.value}
                        onChange={({ target }) => {
                          const val = target.value;
                          const isDecimalField =
                            v.field === ProtocolVariableFieldEnum.EXAM_REF ||
                            v.field === "exam" ||
                            v.field === ProtocolVariableFieldEnum.WEIGHT;
                          const isIntegerField =
                            v.field === ProtocolVariableFieldEnum.AGE;
                          if (
                            isDecimalField &&
                            val !== "" &&
                            !/^-?\d*\.?\d*$/.test(val)
                          ) {
                            return;
                          }
                          if (
                            isIntegerField &&
                            val !== "" &&
                            !/^-?\d*$/.test(val)
                          ) {
                            return;
                          }
                          setConfig(idx, "value", val);
                        }}
                      />
                    )}
                    {(v.field === ProtocolVariableFieldEnum.EXAM_REF ||
                      v.field === "exam" ||
                      v.field === ProtocolVariableFieldEnum.WEIGHT) &&
                      v.operator !== "IN" &&
                      v.operator !== "NOTIN" && (
                        <div className="form-info">
                          Use ponto (.) como separador decimal. Ex: 1.5
                        </div>
                      )}
                    {v.field === ProtocolVariableFieldEnum.AGE &&
                      v.operator !== "IN" &&
                      v.operator !== "NOTIN" && (
                        <div className="form-info">
                          Informe um número inteiro. Ex: 18
                        </div>
                      )}
                  </div>
                </div>
              </>
            )}
          </VariableContainer>
        ))}
      </VariableGrid>
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
