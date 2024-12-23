import React from "react";

import { Select } from "components/Inputs";
import RegulationRiskTag from "components/RegulationRiskTag";

export default function RegulationRiskField({
  question,
  values,
  setFieldValue,
}) {
  return (
    <Select
      placeholder="Selecione..."
      onChange={(value) => setFieldValue(question.id, value)}
      value={values[question.id] ? values[question.id] : []}
      allowClear
      style={{ minWidth: "300px", ...(question.style || {}) }}
      disabled={question.disabled}
      optionFilterProp="children"
      showSearch
    >
      <Select.Option value={1}>
        <RegulationRiskTag risk={1} />
      </Select.Option>
      <Select.Option value={2}>
        <RegulationRiskTag risk={2} />
      </Select.Option>
      <Select.Option value={3}>
        <RegulationRiskTag risk={3} />
      </Select.Option>
      <Select.Option value={4}>
        <RegulationRiskTag risk={4} />
      </Select.Option>
    </Select>
  );
}
