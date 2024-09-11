import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import DrugAlertInteractionTypeEnum from "models/DrugAlertInteractionTypeEnum";

export default function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesStatus = useSelector(
    (state) => state.lists.getSubstances.status
  );

  return (
    <Col xs={24} md={14}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={24}>
          <Heading as="label" htmlFor="date" size="14px">
            Subst. relacionada:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.idDestinationList}
            onChange={(value, option) =>
              setFieldValue({ idDestinationList: value })
            }
            loading={substancesStatus === "loading"}
            mode="multiple"
            allowClear
          >
            {substances.map(({ sctid, name }) => (
              <Select.Option key={sctid} value={sctid}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Tipo:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.kindList}
            onChange={(value, option) => setFieldValue({ kindList: value })}
            mode="multiple"
            maxTagCount="responsive"
            allowClear
          >
            {DrugAlertInteractionTypeEnum.getAlertInteractionTypes(t).map(
              (a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.label}
                </Select.Option>
              )
            )}
          </Select>
        </Col>
        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Nível:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasHandling}
            onChange={(value, option) => setFieldValue({ level: value })}
            allowClear
          >
            <Select.Option value={"low"}>Baixo</Select.Option>
            <Select.Option value={"medium"}>Médio</Select.Option>
            <Select.Option value={"high"}>Alto</Select.Option>
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Situação:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.status}
            onChange={(value, option) => setFieldValue({ status: value })}
            allowClear
          >
            <Select.Option value={1}>Ativo</Select.Option>
            <Select.Option value={0}>Inativo</Select.Option>
          </Select>
        </Col>
      </Row>
    </Col>
  );
}
