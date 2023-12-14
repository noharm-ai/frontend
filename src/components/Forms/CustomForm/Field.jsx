import React from "react";

import { Select, InputNumber, Textarea } from "components/Inputs";
import Editor from "components/Editor";

import MemoryField from "./Fields/MemoryField";
import SubstanceField from "./Fields/SubstanceField";
import { EditorBox } from "../Form.style";

export default function Field({ question, values, setFieldValue }) {
  const keydownEvent = (e) => {
    if (e.ctrlKey) {
      e.target.blur();
    }
  };

  if (question.type === "options" || question.type === "options-multiple") {
    return (
      <Select
        placeholder="Selecione..."
        onChange={(value) => setFieldValue(question.id, value)}
        value={values[question.id]}
        allowClear
        style={{ minWidth: "300px" }}
        mode={question.type === "options-multiple" ? "multiple" : "default"}
        disabled={question.disabled}
      >
        {question.options.map((option) => (
          <Select.Option value={option} key={option}>
            {option}
          </Select.Option>
        ))}
      </Select>
    );
  }

  if (
    question.type === "options-key-value" ||
    question.type === "options-key-value-multiple"
  ) {
    return (
      <Select
        placeholder="Selecione..."
        onChange={(value) => setFieldValue(question.id, value)}
        value={values[question.id]}
        allowClear
        style={{ minWidth: "300px", ...(question.style || {}) }}
        mode={
          question.type === "options-key-value-multiple"
            ? "multiple"
            : "default"
        }
        disabled={question.disabled}
      >
        {question.options.map((option) => (
          <Select.Option value={option.id} key={option.id}>
            {option.value}
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
        disabled={question.disabled}
        value={values[question.id]}
        onChange={(value) => setFieldValue(question.id, value)}
      />
    );
  }

  if (question.type === "number-no-key-event") {
    return (
      <InputNumber
        style={{
          width: 120,
        }}
        min={0}
        max={99999}
        disabled={question.disabled}
        value={values[question.id]}
        onChange={(value) => setFieldValue(question.id, value)}
        keyboard={false}
        onKeyDown={keydownEvent}
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

  if (question.type === "json") {
    return (
      <Textarea
        value={values[question.id]}
        onChange={({ target }) => setFieldValue(question.id, target.value)}
        style={{ minHeight: "400px", ...(question.style || {}) }}
      ></Textarea>
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
