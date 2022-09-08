import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { Select, RangeDatePicker } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import Tooltip from "components/Tooltip";

export default function MainFilters({
  segments,
  fetchDepartmentsList,
  resetDepartmentsList,
}) {
  const { t, i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  useEffect(() => {
    resetDepartmentsList();
    if (values.idSegment == null) return;

    fetchDepartmentsList(values.idSegment);
  }, [values.idSegment, fetchDepartmentsList, resetDepartmentsList]);

  const onChangeSegment = (value) => {
    setFieldValue({
      idSegment: value,
      idDepartment: [],
    });
  };

  const onChangeNextAppointment = (value) => {
    const startDate = value[0] ? moment(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? moment(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      nextAppointmentStartDate: startDate,
      nextAppointmentEndDate: endDate,
    });
  };

  return (
    <>
      <Col md={6}>
        <Heading as="label" htmlFor="segments" size="14px">
          {t("screeningList.segment")}:
        </Heading>
        <Select
          id="segments"
          style={{ width: "100%" }}
          loading={segments.isFetching}
          onChange={onChangeSegment}
          value={values.idSegment}
        >
          {segments.list.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={6}>
        <Heading as="label" htmlFor="departments" size="14px">
          {t("screeningList.labelDepartment")}:
        </Heading>
        <Select
          id="departments"
          mode="multiple"
          optionFilterProp="children"
          style={{ width: "100%" }}
          placeholder={t("screeningList.labelDepartmentPlaceholder")}
          loading={segments.single.isFetching}
          value={values.idDepartment}
          onChange={(value) => setFieldValue({ idDepartment: value })}
          autoClearSearchValue={false}
          allowClear
        >
          {segments.single.content.departments &&
            segments.single.content.departments.map(
              ({ idDepartment, name }) => (
                <Select.Option key={idDepartment} value={idDepartment}>
                  {name}
                </Select.Option>
              )
            )}
        </Select>
      </Col>
      <Col md={7} lg={7} xxl={5}>
        <Heading as="label" htmlFor="date" size="14px">
          <Tooltip title="Data do último ou próximo atendimento">
            {t("tableHeader.refDate")}:
          </Tooltip>
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.nextAppointmentStartDate
              ? moment(values.nextAppointmentStartDate)
              : null,
            values.nextAppointmentEndDate
              ? moment(values.nextAppointmentEndDate)
              : null,
          ]}
          onChange={onChangeNextAppointment}
          dropdownClassName="noArrow"
          allowClear={false}
          language={i18n.language}
        />
      </Col>
    </>
  );
}
