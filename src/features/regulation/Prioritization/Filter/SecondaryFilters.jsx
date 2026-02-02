import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card } from "antd";
import dayjs from "dayjs";

import { Col, Row } from "components/Grid";
import {
  RangeDatePicker,
  Select,
  Radio,
  SelectCustom,
} from "components/Inputs";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getRegulationTypes } from "features/lists/ListsSlice";
import notification from "components/notification";
import FieldNameAutocomplete from "features/fields/FieldNameAutocomplete/FieldNameAutocomplete";
import { FieldIcd } from "src/features/fields/FieldIcd/FieldIcd";

import { Form } from "styles/Form.style";

export default function SecondaryFilters() {
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

  const typeOptionsNullable = [
    { label: "Exame", value: 1 },
    { label: "Encaminhamento", value: 2 },
    { label: "Todos", value: null },
  ];

  const onChangeDates = (value, field) => {
    const startDate =
      value && value[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null;
    const endDate =
      value && value[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null;

    setFieldValue({
      [`${field}StartDate`]: startDate,
      [`${field}EndDate`]: endDate,
    });
  };

  const filterTypes = (type, list) => {
    return list.filter((i) => {
      if (!type) {
        return true;
      }

      return type === i.type;
    });
  };

  const icdGroups = [
    {
      value: "ONCO",
      label: "Oncológico",
    },
  ];

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title="Solicitação"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Protocolo:</label>
                </div>
                <div className="form-input">
                  <Select
                    mode="tags"
                    placeholder="Digite o número do protocolo e pressione enter"
                    tokenSeparators={[","]}
                    className={values.idList?.length ? "warning" : null}
                    value={values.idList}
                    onChange={(value) => setFieldValue({ idList: value })}
                    notFoundContent="Digite o número do protocolo e pressione enter. Mais de um protocolo pode ser informado."
                    allowClear
                  ></Select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Tipo:</label>
              </div>
              <div className="form-input">
                <SelectCustom
                  style={{ width: "100%" }}
                  value={values.typeList}
                  onChange={(val) => setFieldValue({ typeList: val })}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  mode="multiple"
                  maxTagCount="responsive"
                  loading={regulationTypesStatus === "loading"}
                  autoClearSearchValue={false}
                >
                  {filterTypes(values.typeType, regulationTypes).map((i) => (
                    <Select.Option key={i.id} value={i.id}>
                      {i.name} ({i.id})
                    </Select.Option>
                  ))}
                </SelectCustom>
                <Radio.Group
                  options={typeOptionsNullable}
                  optionType="button"
                  onChange={({ target: { value } }) =>
                    setFieldValue({ typeType: value })
                  }
                  value={values.typeType}
                  style={{ marginTop: "5px" }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-label">
                <label>Risco:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.riskList}
                  onChange={(val) => setFieldValue({ riskList: val })}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  mode="multiple"
                  maxTagCount="responsive"
                >
                  {[1, 2, 3, 4].map((risk) => (
                    <Select.Option key={risk} value={risk}>
                      {t(`regulation.risk.risk_${risk}`)}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
          </Form>
        </Card>
      </Col>
      <Col md={12}>
        <Card
          title="Agendamentos"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>Data de agendamento:</label>
              </div>
              <div className="form-input">
                <RangeDatePicker
                  format="DD/MM/YYYY"
                  value={[
                    values.scheduleStartDate
                      ? dayjs(values.scheduleStartDate)
                      : null,
                    values.scheduleEndDate
                      ? dayjs(values.scheduleEndDate)
                      : null,
                  ]}
                  onChange={(value) => onChangeDates(value, "schedule")}
                  style={{ width: "100%" }}
                  allowClear
                  language={i18n.language}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Data de transporte:</label>
              </div>
              <div className="form-input">
                <RangeDatePicker
                  format="DD/MM/YYYY"
                  value={[
                    values.transportationStartDate
                      ? dayjs(values.transportationStartDate)
                      : null,
                    values.transportationEndDate
                      ? dayjs(values.transportationEndDate)
                      : null,
                  ]}
                  onChange={(value) => onChangeDates(value, "transportation")}
                  style={{ width: "100%" }}
                  allowClear
                  language={i18n.language}
                />
              </div>
            </div>
          </Form>
        </Card>
      </Col>
      <Col md={12}>
        <Card
          title="Paciente"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>Nome do Paciente:</label>
              </div>
              <div className="form-input">
                <FieldNameAutocomplete
                  onChange={(val) => setFieldValue({ idPatientList: val })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>CID:</label>
              </div>
              <div className="form-input">
                <FieldIcd
                  onChange={(val) => setFieldValue({ idIcdList: val })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Grupos de CID:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.idIcdGroupList}
                  onChange={(val) => setFieldValue({ idIcdGroupList: val })}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  maxTagCount="responsive"
                  mode="multiple"
                  options={icdGroups}
                />
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
