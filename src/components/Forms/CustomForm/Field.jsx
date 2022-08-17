import React from "react";

import { Select, InputNumber } from "components/Inputs";
import Editor from "components/Editor";

import MemoryField from "./Fields/MemoryField";
import SubstanceField from "./Fields/SubstanceField";
import { EditorBox } from "../Form.style";

export default function Field({ question, values, setFieldValue }) {
  if (question.type === "options" || question.type === "options-multiple") {
    return (
      <Select
        placeholder="Selecione..."
        onChange={(value) => setFieldValue(question.id, value)}
        value={values[question.id]}
        allowClear
        style={{ minWidth: "300px" }}
        mode={question.type === "options-multiple" ? "multiple" : "default"}
      >
        {question.options.map((option) => (
          <Select.Option value={option} key={option}>
            {option}
          </Select.Option>
        ))}
      </Select>
    );
  }

  if (question.type === "number") {
    return (
      <InputNumber
        style={{
          width: 120,
        }}
        min={0}
        max={99999}
        value={values[question.id]}
        onChange={(value) => setFieldValue(question.id, value)}
      />
    );
  }

  if (question.type === "text") {
    return (
      <EditorBox>
        <Editor
          onEdit={(value) => setFieldValue(question.id, value)}
          content={values[question.id]}
        />
      </EditorBox>
    );
  }

  if (question.type === "memory-multiple" || question.type === "memory") {
    return (
      <MemoryField
        question={question}
        values={values}
        setFieldValue={setFieldValue}
      />
    );
  }

  if (question.type === "substance") {
    return (
      <SubstanceField
        question={question}
        values={values}
        setFieldValue={setFieldValue}
      />
    );
  }
}
