import React from "react";
import { useFormikContext } from "formik";

import MemoryText from "containers/MemoryText";
import Heading from "components/Heading";

import Field from "./Field";
import { Box, FieldError, FieldHelp } from "../Form.style";

export default function Base({ item, horizontal, onChange }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();

  const setValue = (id, value) => {
    setFieldValue(id, value);

    if (onChange) {
      onChange({ ...values, [id]: value });
    }
  };

  return (
    <div style={{ display: horizontal ? "flex" : "block" }}>
      {item.questions.map((question) => (
        <Box
          hasError={errors[question.id] && touched[question.id]}
          key={question.id}
          className="question-group"
          horizontal={horizontal}
        >
          <div style={{ width: horizontal ? "auto" : "100%" }}>
            <div className="label-container">
              <div className="label">
                <Heading as="label" $size="14px">
                  {question.label}
                </Heading>
              </div>

              {question.type === "text" && (
                <MemoryText
                  storeId={`cf-text-${question.id}`}
                  memoryType={`cf-text-${question.id}`}
                  content={values[question.id]}
                  onLoad={(value) => setValue(question.id, value)}
                />
              )}
            </div>

            <Field
              question={question}
              values={values}
              setFieldValue={setValue}
            />
            {question.help && <FieldHelp>{question.help}</FieldHelp>}
            {errors[question.id] && touched[question.id] && (
              <FieldError>{errors[question.id]}</FieldError>
            )}
          </div>
        </Box>
      ))}
    </div>
  );
}
