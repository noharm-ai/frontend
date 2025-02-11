import "styled-components";
import React from "react";
import { useFormikContext } from "formik";

import { Col } from "components/Grid";
import Editor from "components/Editor";
import RichTextView from "components/RichTextView";

import DrugData from "../Intervention/DrugData";
import { Box, FieldError, EditorBox } from "../Form.style";

export default function BaseNotes({ item }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { notes } = values;

  return (
    <>
      <DrugData item={item} />
      <Box hasError={errors.notes && touched.notes}>
        <Col xs={24}>
          <EditorBox>
            <Editor
              onEdit={(value) => setFieldValue("notes", value)}
              content={notes || ""}
              onReady={(editor) => {
                editor.editing.view.focus();
              }}
            />
          </EditorBox>

          {errors.notes && touched.notes && (
            <FieldError>{errors.notes}</FieldError>
          )}

          {item.prevNotes && (
            <div style={{ marginTop: "10px" }}>
              <strong>Anotação anterior:</strong>
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #ccc",
                  padding: "5px",
                }}
              >
                <RichTextView text={item.prevNotesUser} />
              </div>
            </div>
          )}
        </Col>
      </Box>
    </>
  );
}
