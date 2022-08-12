import "styled-components/macro";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

import Heading from "components/Heading";
import { Row, Col } from "components/Grid";
import { Select } from "components/Inputs";
import { createSlug } from "utils/transformers/utils";
import { Box } from "./Filter.style";

const validationSchema = Yup.object().shape({
  idDrug: Yup.number().required("É necessário escolher um medicamento"),
  idSegment: Yup.number().required("É necessário escolher um segmento"),
});

export default function Filter({
  segments,
  drugs,
  outliers,
  fetchOutliersList,
  fetchDrugsUnitsList,
}) {
  const { values } = useFormik({
    validationSchema,
    enableReinitialize: true,
    initialValues: outliers.selecteds,
    onSubmit: fetchOutliersList,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (outliers.selecteds.idDrug) {
      fetchDrugsUnitsList({
        id: outliers.selecteds.idDrug,
        idSegment: outliers.selecteds.idSegment,
      });
    }
  }, [
    fetchDrugsUnitsList,
    outliers.selecteds.idDrug,
    outliers.selecteds.idSegment,
  ]);

  const handleChange = (key, value) => {
    values[key] = value;
    const params = {
      ...values,
      [key]: value,
    };

    if (key === "idSegment") {
      navigate(`/medicamentos/${params.idSegment}`);
    } else {
      const drug = drugs.list.find((item) => item.idDrug === params.idDrug);
      const slug = createSlug(drug.name);
      navigate(`/medicamentos/${params.idSegment}/${params.idDrug}/${slug}`);
    }
  };

  const filterOption = (input, option) =>
    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  return (
    <form css="margin-bottom: 25px;">
      <Row type="flex" gutter={24}>
        <Col span={24} md={8}>
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
              id="idSegment"
              name="idSegment"
              style={{ width: "100%" }}
              placeholder="Selectione um segmento..."
              loading={segments.isFetching}
              value={values.idSegment ? parseInt(values.idSegment, 10) : ""}
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
        <Col span={24} md={24 - 8 - 4}>
          <Box>
            <Heading as="label" htmlFor="drug" size="16px" margin="0 10px 0 0">
              Medicamento:
            </Heading>
            <Select
              id="idDrug"
              name="idDrug"
              style={{ width: "100%" }}
              placeholder="Selectione um medicamento..."
              loading={drugs.isFetching}
              value={values.idDrug}
              onChange={(val) => handleChange("idDrug", val)}
              showSearch
              filterOption={filterOption}
            >
              {drugs.list.map(({ idDrug, name: text }) => (
                <Select.Option key={idDrug} value={idDrug}>
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
