import { useContext } from "react";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import UserSelect from "components/Forms/Fields/UserSelect";

export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

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
    </Row>
  );
}
