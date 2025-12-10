import { useContext } from "react";
import { Card, Slider } from "antd";

import { Col, Row } from "components/Grid";
import { Input } from "components/Inputs";
import { AdvancedFilterContext } from "components/AdvancedFilter";

import { Form } from "styles/Form.style";

export default function SecondaryFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title="Paciente"
          bordered
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Nome:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.name}
                    onChange={({ target }: any) =>
                      setFieldValue({ name: target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>CPF:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.cpf}
                    onChange={({ target }: any) =>
                      setFieldValue({ cpf: target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>CNS:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.cns}
                    onChange={({ target }: any) =>
                      setFieldValue({ cns: target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Intervalo de idade:</label>
                </div>
                <div className="form-input">
                  <Slider
                    range
                    marks={{ 0: 0, 50: 50, 80: 80, 150: 150 }}
                    max={150}
                    value={[values.age_min, values.age_max]}
                    onChange={(value: any) =>
                      setFieldValue({ age_min: value[0], age_max: value[1] })
                    }
                  />
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </Col>
      <Col md={12}>
        <Card
          title="Saúde"
          bordered
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Unidade de saúde:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.health_unit}
                    onChange={({ target }: any) =>
                      setFieldValue({ health_unit: target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Agente de saúde:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.health_agent}
                    onChange={({ target }: any) =>
                      setFieldValue({ health_agent: target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Equipe responsável:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.responsible_team}
                    onChange={({ target }: any) =>
                      setFieldValue({ responsible_team: target.value })
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
