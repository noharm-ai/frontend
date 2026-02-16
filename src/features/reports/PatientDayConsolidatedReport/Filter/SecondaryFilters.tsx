import { useContext } from "react";
import { Card } from "antd";

import { Col, Row } from "components/Grid";
import { InputNumber } from "components/Inputs";
import { AdvancedFilterContext } from "components/AdvancedFilter";

import { Form } from "styles/Form.style";

export default function SecondaryFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  const handleChange = (key: string, value: any) => {
    setFieldValue({ [key]: value });
  };

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
