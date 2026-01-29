import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Slider } from "antd";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Input, Select, Radio } from "components/Inputs";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";

export default function SecondaryFilters() {
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesLoading =
    useSelector((state) => state.lists.getSubstances.status) === "loading";
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  const onChangeAISubstance = (val) => {
    if (!val) {
      setFieldValue({ hasAISubstance: val, aiAccuracyRange: null });
    } else {
      setFieldValue({ hasAISubstance: val, aiAccuracyRange: [0, 100] });
    }
  };

  return (
    <Col xs={24} md={14}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" $size="14px">
            {t("tableHeader.drug")}:
          </Heading>
          <Input
            value={values.term}
            onChange={({ target }) =>
              setFieldValue({ term: target.value !== "" ? target.value : null })
            }
          />
          <div style={{ marginTop: "4px", fontSize: "12px" }}>
            *Utilize o caractere % para procurar por partes de uma palavra. Ex:
            %Morfina%
          </div>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" $size="14px">
            {t("labels.substance")}:
          </Heading>
          <Input
            placeholder="Busca por texto"
            value={values.substance}
            onChange={({ target }) =>
              setFieldValue({
                substance: target.value !== "" ? target.value : null,
              })
            }
          />
          <div style={{ marginTop: "4px", fontSize: "12px" }}>
            *Utilize o caractere % para procurar por partes de uma palavra. Ex:
            %Morfina%
          </div>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" $size="14px">
            {t("labels.substance")}:
          </Heading>
          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.substanceList}
            onChange={(value) => setFieldValue({ substanceList: value })}
            loading={substancesLoading}
            mode="multiple"
            allowClear
            autoClearSearchValue={false}
          >
            {substances.map(({ sctid, name }) => (
              <Select.Option key={sctid} value={sctid}>
                {name}
              </Select.Option>
            ))}
          </Select>
          <Radio.Group
            options={[
              { label: "Possui", value: "in" },
              { label: "Não possui", value: "notin" },
            ]}
            onChange={({ target: { value } }) =>
              setFieldValue({ tpSubstanceList: value })
            }
            value={values.tpSubstanceList}
            style={{ marginTop: "5px" }}
          />
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" $size="14px">
            Filtrar por atributo
          </Heading>
          <Select
            onChange={(value) => setFieldValue({ attributeList: value })}
            value={values.attributeList}
            optionFilterProp="children"
            showSearch
            autoFocus
            allowClear
            mode="multiple"
            style={{ width: "400px" }}
          >
            <Select.OptGroup label="Classificação">
              <Select.Option key="mav" value="mav">
                Alta Vigilância
              </Select.Option>

              <Select.Option key="antimicro" value="antimicro">
                Antimicrobiano
              </Select.Option>

              <Select.Option key="controlados" value="controlados">
                Controlados
              </Select.Option>

              <Select.Option key="dialisavel" value="dialisavel">
                Dialisável
              </Select.Option>

              <Select.Option key="jejum" value="jejum">
                Jejum
              </Select.Option>

              <Select.Option key="idoso" value="idoso">
                MPI
              </Select.Option>

              <Select.Option key="naopadronizado" value="naopadronizado">
                Não Padronizado
              </Select.Option>

              <Select.Option key="quimio" value="quimio">
                Quimioterápico
              </Select.Option>

              <Select.Option key="linhabranca" value="linhabranca">
                Sem validação
              </Select.Option>

              <Select.Option key="sonda" value="sonda">
                Sonda
              </Select.Option>
            </Select.OptGroup>

            <Select.OptGroup label="Valores">
              <Select.Option key="plaquetas" value="plaquetas">
                Alerta de Plaquetas
              </Select.Option>

              <Select.Option key="dosemaxima" value="dosemaxima">
                Dose de Alerta
              </Select.Option>
              <Select.Option key="hepatico" value="hepatico">
                Hepatotóxico
              </Select.Option>
              <Select.Option key="renal" value="renal">
                Nefrotóxico
              </Select.Option>
              <Select.Option key="risco_queda" value="risco_queda">
                Risco de Queda
              </Select.Option>
              <Select.Option key="lactante" value="lactante">
                Risco na Lactação
              </Select.Option>
              <Select.Option key="gestante" value="gestante">
                Risco na Gestação
              </Select.Option>
            </Select.OptGroup>
          </Select>
          <Radio.Group
            options={[
              { label: "Possui", value: "in" },
              { label: "Não possui", value: "notin" },
            ]}
            onChange={({ target: { value } }) =>
              setFieldValue({ tpAttributeList: value })
            }
            value={values.tpAttributeList}
            style={{ marginTop: "5px" }}
          />
        </Col>

        <Col xs={6}>
          <Heading as="label" $size="14px">
            Possui dose máxima:
          </Heading>
          <Select
            style={{ width: "150px" }}
            value={values.hasMaxDose}
            onChange={(val) => setFieldValue({ hasMaxDose: val })}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            <Select.Option key={0} value={true}>
              <Tag color="green">Sim</Tag>
            </Select.Option>
            <Select.Option key={1} value={false}>
              <Tag color="red">Não</Tag>
            </Select.Option>
          </Select>
        </Col>
        <Col xs={6}>
          <Heading as="label" $size="14px">
            Dose máxima referência:
          </Heading>
          <Select
            style={{ width: "100%" }}
            value={values.tpRefMaxDose}
            onChange={(val) => setFieldValue({ tpRefMaxDose: val })}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            <Select.Option value={"empty"}>Referência vazia</Select.Option>
            <Select.Option value={"diff"}>Divergente</Select.Option>
            <Select.Option value={"equal"}>Igual</Select.Option>
          </Select>
        </Col>

        <Col xs={12}>
          <Heading as="label" $size="14px">
            <Tooltip title="Indica medicamentos que possuem inconsistências no banco de dados">
              Exibir somente medicamentos inconsistentes
            </Tooltip>
          </Heading>
          <Select
            style={{ width: "150px" }}
            value={values.hasInconsistency}
            onChange={(val) => setFieldValue({ hasInconsistency: val })}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            <Select.Option key={0} value={true}>
              <Tag color="green">Sim</Tag>
            </Select.Option>
            <Select.Option key={1} value={false}>
              <Tag color="red">Não</Tag>
            </Select.Option>
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" $size="14px">
            Medicamentos com substâncias definidas pela IA
          </Heading>
          <Select
            style={{ width: "150px" }}
            value={values.hasAISubstance}
            onChange={(val) => onChangeAISubstance(val)}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            <Select.Option key={0} value={true}>
              <Tag color="green">Sim</Tag>
            </Select.Option>
            <Select.Option key={1} value={false}>
              <Tag color="red">Não</Tag>
            </Select.Option>
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" $size="14px">
            Acurácia IA
          </Heading>
          <Slider
            range
            defaultValue={[0, 100]}
            marks={{ 0: 0, 50: 50, 100: 100 }}
            value={values.aiAccuracyRange}
            disabled={!values.hasAISubstance}
            onChange={(value) => setFieldValue({ aiAccuracyRange: value })}
          />
        </Col>
      </Row>
    </Col>
  );
}
