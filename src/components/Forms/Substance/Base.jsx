import React from "react";
import "styled-components/macro";
import { useFormikContext } from "formik";

import { Col } from "components/Grid";
import Heading from "components/Heading";
import { Input } from "components/Inputs";
import Tooltip from "components/Tooltip";

import { Box } from "../Form.style";

export default function Base() {
  const { values, setFieldValue, errors } = useFormikContext();
  const { sctid, name, isAdd } = values;
  const layout = { label: 8, input: 16 };

  return (
    <>
      <Box hasError={errors.sctid}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">SCTID:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          {isAdd && (
            <Input
              value={sctid}
              onChange={({ target }) => setFieldValue("sctid", target.value)}
              maxLength={100}
            />
          )}
          {!isAdd && sctid}
        </Col>
      </Box>

      <Box hasError={errors.name}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Nome:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            value={name}
            onChange={({ target }) => setFieldValue("name", target.value)}
            maxLength={250}
          />
        </Col>
      </Box>
    </>
  );
}
