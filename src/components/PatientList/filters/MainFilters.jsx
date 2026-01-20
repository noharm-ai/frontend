import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { Select, RangeDatePicker } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { getUniqBy } from "utils/report";

export default function MainFilters({ segments }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const departments = useSelector(
    (state) => state.lists.getSegmentDepartments.list
  );
  const departmentsStatus = useSelector(
    (state) => state.lists.getSegmentDepartments.status
  );

  useEffect(() => {
    dispatch(getSegmentDepartments());
  }, []); //eslint-disable-line

  const onChangeSegment = (value) => {
    setFieldValue({
      idSegment: value,
      idDepartment: [],
    });
  };

  const onChangeNextAppointment = (value) => {
    const startDate = value[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      nextAppointmentStartDate: startDate,
      nextAppointmentEndDate: endDate,
    });
  };

  const filterDepartments = (idSegment, list) => {
    const deps = list.filter((d) => {
      if (!idSegment) {
        return true;
      }

      // keep compatibility
      return idSegment === d.idSegment;
    });

    return getUniqBy(deps, "idDepartment");
  };

  return (
    <>
      <Col md={6}>
        <Heading as="label" htmlFor="segments" $size="14px">
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
        <Heading as="label" htmlFor="departments" $size="14px">
          {t("screeningList.labelDepartment")}:
        </Heading>
        <Select
          id="departments"
          mode="multiple"
          optionFilterProp="children"
          style={{ width: "100%" }}
          placeholder={t("screeningList.labelDepartmentPlaceholder")}
          loading={departmentsStatus === "loading"}
          value={values.idDepartment}
          onChange={(value) => setFieldValue({ idDepartment: value })}
          autoClearSearchValue={false}
          allowClear
        >
          {filterDepartments(values.idSegment, departments).map(
            ({ idDepartment, idSegment, label }) => (
              <Select.Option
                key={`${idSegment}-${idDepartment}`}
                value={idDepartment}
              >
                {label}
              </Select.Option>
            )
          )}
        </Select>
      </Col>
      <Col md={7} lg={7} xxl={5}>
        <Heading as="label" htmlFor="date" $size="14px">
          {t("tableHeader.scheduledDate")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.nextAppointmentStartDate
              ? dayjs(values.nextAppointmentStartDate)
              : null,
            values.nextAppointmentEndDate
              ? dayjs(values.nextAppointmentEndDate)
              : null,
          ]}
          onChange={onChangeNextAppointment}
          allowClear={false}
          language={i18n.language}
        />
      </Col>
    </>
  );
}
