import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "antd";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Input, Select } from "components/Inputs";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";

export default function SecondaryFilters() {
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
          <Heading as="label" htmlFor="date" size="14px">
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
          <Heading as="label" htmlFor="date" size="14px">
            {t("labels.substance")}:
          </Heading>
          <Input
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

        <Col xs={24} md={24}>
          <Heading as="label" size="14px">
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
        </Col>

        <Col xs={12}>
          <Heading as="label" size="14px">
            Exibir medicamentos com conversões pendentes
          </Heading>
          <Select
            style={{ width: "150px" }}
            value={values.hasMissingConversion}
            onChange={(val) => setFieldValue({ hasMissingConversion: val })}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            <Select.Option key={0} value={true}>
              <Tag color="green">Sim</Tag>
            </Select.Option>
          </Select>
          <div style={{ marginTop: "4px", fontSize: "12px" }}>
            *Atualizar Unidade Padrão antes de buscar as conversões pendentes
          </div>
        </Col>

        <Col xs={12}>
          <Heading as="label" size="14px">
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
          <Heading as="label" size="14px">
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
          <Heading as="label" size="14px">
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
