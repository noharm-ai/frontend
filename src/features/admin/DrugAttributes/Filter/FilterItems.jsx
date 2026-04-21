import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";

import { Select, Input, InputNumber, Radio } from "components/Inputs";
import Heading from "components/Heading";
import Tag from "components/Tag";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

function IdSegmentListFilter() {
  const { t } = useTranslation();
  const segmentList = useSelector((state) => state.segments.list);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col md={7} lg={4} xxl={4}>
      <Heading as="label" $size="14px">
        {t("screeningList.segment")}:
      </Heading>
      <Select
        style={{ width: "100%", maxWidth: "400px" }}
        value={values.idSegmentList}
        onChange={(val) => setFieldValue({ idSegmentList: val })}
        showSearch
        optionFilterProp="children"
        mode="multiple"
        allowClear
      >
        {segmentList.map(({ id, description: text }) => (
          <Select.Option key={id} value={id}>
            {text}
          </Select.Option>
        ))}
      </Select>
    </Col>
  );
}

function SubstanceStatusFilter() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={24} md={5} lg={3} xxl={2}>
      <Heading as="label" $size="14px">
        Substância:
      </Heading>
      <Select
        style={{ width: "100%" }}
        value={values.substanceStatus}
        onChange={(val) => setFieldValue({ substanceStatus: val })}
        showSearch
        optionFilterProp="children"
        allowClear
      >
        <Select.Option key={0} value={"empty"}>
          <Tag color="red">Não definida</Tag>
        </Select.Option>
        <Select.Option key={1} value={"confirmed"}>
          <Tag color="blue">Definida</Tag>
        </Select.Option>
        <Select.Option key={2} value={"not_confirmed_95"}>
          <Tag color="green">IA: até 95%</Tag>
        </Select.Option>
        <Select.Option key={3} value={"not_confirmed_85"}>
          <Tag color="green">IA: até 85%</Tag>
        </Select.Option>
        <Select.Option key={4} value={"not_confirmed_75"}>
          <Tag color="orange">IA: até 75%</Tag>
        </Select.Option>
        <Select.Option key={5} value={"not_confirmed_50"}>
          <Tag color="red">IA: até 50%</Tag>
        </Select.Option>
        <Select.Option key={6} value={"not_confirmed"}>
          <Tag color="purple">IA: todos</Tag>
        </Select.Option>
      </Select>
    </Col>
  );
}

function MinDrugCountFilter() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={24} md={5} lg={3} xxl={2}>
      <Heading as="label" $size="14px">
        <Tooltip title="Quantidade mínima que o medicamento foi prescrito">
          Contagem mín.:
        </Tooltip>
      </Heading>
      <InputNumber
        value={values.minDrugCount}
        min={0}
        style={{ width: "100%" }}
        onChange={(val) => setFieldValue({ minDrugCount: val })}
      />
    </Col>
  );
}

function TermFilter({ source }) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={source === "main" ? 24 : 12} md={source === "main" ? 6 : 12}>
      <Heading as="label" $size="14px">
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
  );
}

function SubstanceFilter() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={24} md={12}>
      <Heading as="label" $size="14px">
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
  );
}

function SubstanceListFilter() {
  const { t } = useTranslation();
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesLoading =
    useSelector((state) => state.lists.getSubstances.status) === "loading";
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={24} md={12}>
      <Heading as="label" $size="14px">
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
  );
}

function AttributeListFilter() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
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
        style={{ width: "100%" }}
      >
        <Select.OptGroup label="Classificação">
          <Select.Option key="mav" value="mav">
            Alta Vigilância
          </Select.Option>
          <Select.Option key="antimicro" value="antimicro">
            Antimicrobiano
          </Select.Option>
          <Select.Option key="use_weight" value="use_weight">
            Considera peso (escores)
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
  );
}

// hasMaxDose and tpRefMaxDose are logically paired and always rendered together
function HasMaxDoseFilter() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col xs={24} md={6}>
        <Heading as="label" $size="14px">
          Possui dose máxima:
        </Heading>
        <Select
          style={{ width: "100%" }}
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
      <Col xs={24} md={6}>
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
    </>
  );
}

function HasSubstanceMaxDoseWeightAdultFilter() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={24} md={6}>
      <Heading as="label" $size="14px">
        Substância com dose máxima/peso (adulto):
      </Heading>
      <Select
        style={{ width: "100%" }}
        value={values.hasSubstanceMaxDoseWeightAdult}
        onChange={(val) =>
          setFieldValue({ hasSubstanceMaxDoseWeightAdult: val })
        }
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
  );
}

function HasSubstanceMaxDoseWeightPediatricFilter() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Col xs={24} md={6}>
      <Heading as="label" $size="14px">
        Substância com dose máxima/peso (pediátrico):
      </Heading>
      <Select
        style={{ width: "100%" }}
        value={values.hasSubstanceMaxDoseWeightPediatric}
        onChange={(val) =>
          setFieldValue({ hasSubstanceMaxDoseWeightPediatric: val })
        }
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
  );
}

export const FILTER_ITEMS = {
  idSegmentList: IdSegmentListFilter,
  substanceStatus: SubstanceStatusFilter,
  minDrugCount: MinDrugCountFilter,
  term: TermFilter,
  substance: SubstanceFilter,
  substanceList: SubstanceListFilter,
  attributeList: AttributeListFilter,
  hasMaxDose: HasMaxDoseFilter,
  hasSubstanceMaxDoseWeightAdult: HasSubstanceMaxDoseWeightAdultFilter,
  hasSubstanceMaxDoseWeightPediatric: HasSubstanceMaxDoseWeightPediatricFilter,
};
