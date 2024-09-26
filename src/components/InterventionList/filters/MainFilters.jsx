import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import {
  RangeDatePicker,
  InputNumber,
  Select,
  SelectCustom,
} from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import Tag from "components/Tag";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { t, i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const interventionReasonsList = useSelector(
    (state) => state.intervention.reasons.list
  );

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
      <Col md={7} lg={6} xxl={3}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.interventionDate")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.startDate ? dayjs(values.startDate) : null,
            values.endDate ? dayjs(values.endDate) : null,
          ]}
          onChange={onChangeDates}
          popupClassName="noArrow"
          allowClear={false}
          language={i18n.language}
        />
      </Col>
      <Col md={7} lg={5} xxl={4}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.reasons")}:
        </Heading>
        <SelectCustom
          style={{ width: "100%" }}
          onChange={(idInterventionReasonList) =>
            setFieldValue({ idInterventionReasonList })
          }
          value={values.idInterventionReasonList}
          mode="multiple"
          maxTagCount="responsive"
          allowClear
          onSelectAll={() =>
            setFieldValue({
              idInterventionReasonList: interventionReasonsList.map(
                ({ id }) => id
              ),
            })
          }
        >
          {interventionReasonsList.map(({ id, parentName, name }) => (
            <Select.Option key={id} value={id}>
              {parentName ? `${parentName} - ${name}` : name}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={3} xxl={3}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.status")}:
        </Heading>
        <Select
          style={{ width: "100%" }}
          onChange={(statusList) => setFieldValue({ statusList })}
          value={values.statusList}
          mode="multiple"
          maxTagCount="responsive"
          allowClear
        >
          <Select.Option value="a" key="a">
            <Tag color="green">Aceitas</Tag>
          </Select.Option>
          <Select.Option value="n" key="n">
            <Tag color="red">Não aceitas</Tag>
          </Select.Option>
          <Select.Option value="j" key="j">
            <Tag color="red">Não aceitas (Justificadas)</Tag>
          </Select.Option>
          <Select.Option value="x" key="x">
            <Tag>Não se aplica</Tag>
          </Select.Option>
          <Select.Option value="s" key="s">
            <Tag color="orange">Pendentes</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={7} lg={3} xxl={3}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.admissionNumber")}:
        </Heading>
        <InputNumber
          controls={false}
          value={values.admissionNumber}
          onChange={(value) => setFieldValue({ admissionNumber: value })}
        />
      </Col>
    </>
  );
}
