import { useContext } from "react";
import { Card } from "antd";

import { Col, Row } from "components/Grid";
import { InputNumber, Radio } from "components/Inputs";
import { AdvancedFilterContext } from "components/AdvancedFilter";

import { Form } from "styles/Form.style";

export default function SecondaryFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  const handleChange = (key: string, value: any) => {
    setFieldValue({ [key]: value });
  };

  const yesNoOptions = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];

  const dischargeOptions = [
    { label: "Sim", value: "remove_discharged_day" },
    {
      label: "Sim, mantendo checadas",
      value: "remove_discharged_day_keep_checked",
    },
    { label: "Não", value: "do_not_remove" },
  ];

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title="Geral"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Somente dias de semana:</label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    style={{ marginTop: "5px" }}
                    options={yesNoOptions}
                    onChange={({ target: { value } }) =>
                      handleChange("weekdays_only", value)
                    }
                    value={values.weekdays_only}
                    optionType="button"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>
                    Contabilizar prescrições que possuam somente
                    Dietas/Recomendações:
                  </label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    style={{ marginTop: "5px" }}
                    options={yesNoOptions}
                    onChange={({ target: { value } }) =>
                      setFieldValue({ consider_empty_prescriptions: value })
                    }
                    value={values.consider_empty_prescriptions}
                    optionType="button"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Remover prescrições do dia da alta:</label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    style={{ marginTop: "5px" }}
                    options={dischargeOptions}
                    onChange={({ target: { value } }) =>
                      setFieldValue({
                        remove_prescription_at_discharge_date: value,
                      })
                    }
                    value={values.remove_prescription_at_discharge_date}
                    optionType="button"
                  />
                </div>
                <div
                  style={{ opacity: 0.6, fontSize: "12px", marginTop: "5px" }}
                >
                  *Filtro disponível somente em períodos a partir de DEZ/25.
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Escore Global Mínimo:</label>
                </div>
                <div className="form-input">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    value={values.global_score_start}
                    onChange={(val: any) =>
                      handleChange("global_score_start", val)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Escore Global Máximo:</label>
                </div>
                <div className="form-input">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    value={values.global_score_end}
                    onChange={(val: any) =>
                      handleChange("global_score_end", val)
                    }
                  />
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
