import React from "react";
import dayjs from "dayjs";
import "styled-components";
import { useFormikContext } from "formik";

import { Col } from "components/Grid";
import { Textarea, DatePicker } from "components/Inputs";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";

import { Box, EditorBox, FieldError } from "../Form.style";

export default function Base() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { alert, alertExpire } = values;
  const layout = { label: 4, input: 20 };

  return (
    <>
      <Box>
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            <Tooltip title="Data em que o alerta deve parar de ser exibido">
              Expira em:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <DatePicker
            format="DD/MM/YYYY HH:mm"
            value={alertExpire ? dayjs(alertExpire) : null}
            onChange={(value) =>
              setFieldValue("alertExpire", value.format("YYYY-MM-DDTHH:mm:00"))
            }
            popupClassName="noArrow"
            allowClear={false}
            showTime
            status={errors.alertExpire && touched.alertExpire ? "error" : null}
          />
          {errors.alertExpire && touched.alertExpire && (
            <FieldError>{errors.alertExpire}</FieldError>
          )}
        </Col>
      </Box>
      <Box>
        <Col xs={24} style={{ paddingBottom: "0" }}>
          <Heading as="label" $size="14px">
            <Tooltip title="">Alerta:</Tooltip>
          </Heading>
        </Col>
        <Col xs={24}>
          <EditorBox>
            <Textarea
              autoFocus
              status={errors.alert && touched.alert ? "error" : null}
              value={alert}
              onChange={({ target }) => setFieldValue("alert", target.value)}
              style={{ minHeight: "300px" }}
              maxLength={1950}
            />
            {errors.alert && touched.alert && (
              <FieldError>{errors.alert}</FieldError>
            )}
          </EditorBox>
        </Col>
      </Box>
    </>
  );
}
