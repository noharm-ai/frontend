import { useContext } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, RangeDatePicker } from "components/Inputs";
import UserSelect from "components/Forms/Fields/UserSelect";

export function SecondaryFilters() {
  const { t, i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  const onChangeDischargeDate = (value: any[]) => {
    const startDate = value[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      dischargeDateStart: startDate,
      dischargeDateEnd: endDate,
    });
  };

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={18} xxl={14}>
        <Heading {...{ as: "label", htmlFor: "segments", $size: "14px" } as any}>
          {t("labels.scheduledBy")}:
        </Heading>
        <UserSelect
          value={values.scheduledBy}
          onChange={(ids: number[]) => setFieldValue({ scheduledBy: ids })}
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading {...{ as: "label", htmlFor: "segments", $size: "14px" } as any}>
          {t("labels.attendedBy")}:
        </Heading>
        <UserSelect
          value={values.attendedBy}
          onChange={(ids: number[]) => setFieldValue({ attendedBy: ids })}
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading {...{ as: "label", htmlFor: "segments", $size: "14px" } as any}>
          {t("labels.appointment")}:
        </Heading>
        <Select
          placeholder="Selecione o tipo de conciliação"
          onChange={(value: any) => setFieldValue({ appointment: value })}
          value={values.appointment}
          allowClear
        >
          <Select.Option value="scheduled" key="scheduled">
            Com agendamento
          </Select.Option>
          <Select.Option value="not-scheduled" key="no-appointment">
            Sem agendamento
          </Select.Option>
        </Select>
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading {...{ as: "label", $size: "14px" } as any}>
          {t("labels.dischargeDate")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.dischargeDateStart ? dayjs(values.dischargeDateStart) : null,
            values.dischargeDateEnd ? dayjs(values.dischargeDateEnd) : null,
          ]}
          onChange={onChangeDischargeDate}
          allowClear
          language={i18n.language}
        />
      </Col>
    </Row>
  );
}
