import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSubstances } from "features/lists/ListsSlice";
import DrugAlertInteractionTypeEnum from "models/DrugAlertInteractionTypeEnum";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesStatus = useSelector(
    (state) => state.lists.getSubstances.status
  );

  useEffect(() => {
    dispatch(getSubstances({ useCache: true }));
  }, [dispatch]);

  return (
    <>
      <Col md={5} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Subst. Origem:
        </Heading>
        <Select
          id="idclass"
          optionFilterProp="children"
          showSearch
          style={{ width: "100%" }}
          value={values.idOriginList}
          onChange={(value, option) => setFieldValue({ idOriginList: value })}
          loading={substancesStatus === "loading"}
          mode="multiple"
          maxTagCount="responsive"
          allowClear
        >
          {substances.map(({ sctid, name }) => (
            <Select.Option key={sctid} value={sctid}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={5} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Subst. Relacionada:
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
          maxTagCount="responsive"
          allowClear
        >
          {substances.map(({ sctid, name }) => (
            <Select.Option key={sctid} value={sctid}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={4}>
        <Heading as="label" size="14px">
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
          {DrugAlertInteractionTypeEnum.getAlertInteractionTypes(t).map((a) => (
            <Select.Option key={a.id} value={a.id}>
              {a.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={3} lg={3} xxl={2}>
        <Heading as="label" size="14px">
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
      <Col md={3} lg={3} xxl={2}>
        <Heading as="label" size="14px">
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
    </>
  );
}
