import React, { useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { Select, RangeDatePicker } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import RegulationStage from "models/regulation/RegulationStage";
import { getRegulationTypes } from "features/lists/ListsSlice";
import notification from "components/notification";

export default function MainFilters() {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const regulationTypes = useSelector(
    (state) => state.lists.regulation.types.list
  );
  const regulationTypesStatus = useSelector(
    (state) => state.lists.regulation.types.status
  );

  useEffect(() => {
    dispatch(getRegulationTypes()).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      }
    });
  }, [dispatch, t]);

  const onChangeDates = (value) => {
    const startDate = value[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      startDate,
      endDate,
    });
  };

  return (
    <>
      <Col md={7} lg={6} xxl={4}>
        <Heading as="label" htmlFor="date" size="14px">
          Data da solicitação
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.startDate ? dayjs(values.startDate) : null,
            values.endDate ? dayjs(values.endDate) : null,
          ]}
          onChange={onChangeDates}
          style={{ width: "100%" }}
          popupClassName="noArrow"
          allowClear={false}
          language={i18n.language}
        />
      </Col>
      <Col md={5} lg={7} xxl={6}>
        <Heading as="label" size="14px">
          Tipo:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.typeList}
          onChange={(val) => setFieldValue({ typeList: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          mode="multiple"
          maxTagCount="responsive"
          loading={regulationTypesStatus === "loading"}
        >
          {regulationTypes.map((i) => (
            <Select.Option key={i.id} value={i.id}>
              {i.name} ({i.id})
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={5} lg={4} xxl={4}>
        <Heading as="label" size="14px">
          Etapa:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.stageList}
          onChange={(val) => setFieldValue({ stageList: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          mode="multiple"
          maxTagCount="responsive"
        >
          {RegulationStage.getStages(t).map((s) => (
            <Select.Option key={s.id} value={s.id}>
              {s.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
