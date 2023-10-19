import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Input, Select } from "components/Inputs";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";

export default function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("tableHeader.drug")}:
        </Heading>
        <Input
          style={{ width: "400px" }}
          value={values.term}
          onChange={({ target }) =>
            setFieldValue({ term: target.value !== "" ? target.value : null })
          }
        />
      </Col>

      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          <Tooltip title="Indica se o medicamento já foi prescrito na NoHarm">
            Somente medicamentos prescritos
          </Tooltip>
        </Heading>
        <Select
          style={{ width: "150px" }}
          value={values.hasPrescription}
          onChange={(val) => setFieldValue({ hasPrescription: val })}
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
    </Row>
  );
}
