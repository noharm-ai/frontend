import React from "react";
import { WarningOutlined } from "@ant-design/icons";

import { evaluateFormula } from "./formulaEvaluator";

export default function CalculatedField({ question, values }) {
  const { value, error } = evaluateFormula(question.formula || "", values);

  if (error) {
    return (
      <span style={{ color: "#faad14" }}>
        <WarningOutlined /> {error}
      </span>
    );
  }

  return <span>{value}</span>;
}
