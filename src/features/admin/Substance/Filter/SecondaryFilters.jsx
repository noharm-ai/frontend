import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, Radio } from "components/Inputs";
import { fetchSubstanceClasses } from "features/lists/ListsSlice";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

export default function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const dispatch = useDispatch();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
  const substanceClassesStatus = useSelector(
    (state) => state.lists.substanceClasses.status
  );

  useEffect(() => {
    if (substanceClasses.length === 0) {
      dispatch(fetchSubstanceClasses());
    }
  }, []); //eslint-disable-line

  return (
    <Col xs={24} md={14}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Classe:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.idClassList}
            onChange={(value, option) => setFieldValue({ idClassList: value })}
            loading={substanceClassesStatus === "loading"}
            mode="multiple"
            maxTagCount="responsive"
            allowClear
          >
            {substanceClasses.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Manejo:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.handlingTypeList}
            onChange={(value, option) =>
              setFieldValue({ handlingTypeList: value })
            }
            mode="multiple"
            maxTagCount="responsive"
            allowClear
          >
            {DrugAlertTypeEnum.getAlertTypes(t).map((a) => (
              <Select.Option key={a.id} value={a.id}>
                {a.label}
              </Select.Option>
            ))}
          </Select>
          <Radio.Group
            options={[
              { label: "Preenchido", value: "filled" },
              { label: "Vazio", value: "empty" },
            ]}
            onChange={({ target: { value } }) =>
              setFieldValue({ handlingOption: value })
            }
            value={values.handlingOption}
          />
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" size="14px">
            Possui texto curadoria:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasAdminText}
            onChange={(value) => setFieldValue({ hasAdminText: value })}
            allowClear
          >
            <Select.Option value={1}>Sim</Select.Option>
            <Select.Option value={0}>Não</Select.Option>
          </Select>
        </Col>
      </Row>
    </Col>
  );
}
