import "styled-components/macro";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

import Heading from "components/Heading";
import { Row, Col } from "components/Grid";
import { Select } from "components/Inputs";
import { createSlug } from "utils/transformers/utils";
import { Box } from "./Filter.style";

const validationSchema = Yup.object().shape({
  idSegment: Yup.number().required("É necessário escolher um segmento"),
});

export default function Filter({ segments }) {
  const { values } = useFormik({
    validationSchema,
    enableReinitialize: true,
    initialValues: segments.firstFilter,
  });
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    values[key] = value;
    const params = {
      ...values,
      [key]: value,
    };

    const segment = segments.list.find((item) => item.id === params.idSegment);
    const slug = createSlug(segment.description);

    navigate(`/exames/${params.idSegment}/${slug}`);
  };

  const filterOption = (input, option) =>
    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  return (
    <form css="margin-bottom: 25px;">
      <Row type="flex" gutter={24}>
        <Col span={24} md={16}>
          <Box>
            <Heading
              as="label"
              htmlFor="segments"
              size="16px"
              margin="0 10px 0 0"
            >
              Segmento:
            </Heading>
            <Select
              id="idSegmentSegment"
              name="idSegment"
              style={{ width: "100%" }}
              placeholder="Selecione um segmento..."
              loading={segments.isFetching}
              value={values.idSegment}
              onChange={(val) => handleChange("idSegment", val)}
              showSearch
              filterOption={filterOption}
            >
              {segments.list.map(({ id, description: text }) => (
                <Select.Option key={id} value={id}>
                  {text}
                </Select.Option>
              ))}
            </Select>
          </Box>
        </Col>
      </Row>
    </form>
  );
}
