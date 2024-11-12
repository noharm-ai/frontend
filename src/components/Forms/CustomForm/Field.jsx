import React from "react";
import { Checkbox, Row, Col } from "antd";
import dayjs from "dayjs";

import { Select, InputNumber, Textarea, DatePicker } from "components/Inputs";
import Editor from "components/Editor";

import MemoryField from "./Fields/MemoryField";
import SubstanceField from "./Fields/SubstanceField";
import { EditorBox, CheckboxDescription } from "../Form.style";

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

  if (question.type === "date") {
    return (
      <DatePicker
        format="DD/MM/YYYY"
        disabled={question.disabled}
        value={
          values[question.id] ? dayjs(values[question.id], "DD/MM/YYYY") : null
        }
        onChange={(value) =>
          setFieldValue(question.id, value ? value.format("DD/MM/YYYY") : null)
        }
        popupClassName="noArrow"
        allowClear
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
          content={values[question.id] || ""}
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

  if (question.type === "checkbox") {
    return (
      <Checkbox.Group
        style={{ width: "100%" }}
        value={values[question.id]}
        onChange={(checkedValues) => setFieldValue(question.id, checkedValues)}
      >
        <Row gutter={[24, 24]}>
          {question.options.map((option) => (
            <Col span={12} key={option.id}>
              <Checkbox style={{ fontWeight: 700 }} value={option.id}>
                {option.label}
              </Checkbox>
              <CheckboxDescription>{option.description}</CheckboxDescription>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    );
  }
}
