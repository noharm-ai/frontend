import { useFormikContext } from "formik";

import { InputNumber, Input } from "components/Inputs";
import Switch from "components/Switch";
import Card from "components/Card";
import { Row, Col } from "components/Grid";

export default function Base() {
  const { values, setFieldValue, errors }: any = useFormikContext<any>();

  return (
    <>
      <div className={`form-row ${errors.tp_exam ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo de Exame:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.tp_exam}
            onChange={({ target }) => setFieldValue("tp_exam", target.value)}
            maxLength={50}
            placeholder="Código identificador do tipo de exame"
            disabled={!values.newGlobalExam}
          />
        </div>
        {errors.tp_exam && <div className="form-error">{errors.tp_exam}</div>}
      </div>

      <div className={`form-row ${errors.name ? "error" : ""}`}>
        <div className="form-label">
          <label>Nome:*</label>
        </div>
        <div className="form-input">
          <Input
            value={values.name}
            onChange={({ target }) => setFieldValue("name", target.value)}
            maxLength={250}
            placeholder="Nome do exame"
          />
        </div>
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className={`form-row ${errors.initials ? "error" : ""}`}>
        <div className="form-label">
          <label>Rótulo:*</label>
        </div>
        <div className="form-input">
          <Input
            value={values.initials}
            onChange={({ target }) => setFieldValue("initials", target.value)}
            maxLength={50}
            placeholder="Sigla ou rótulo do exame"
          />
        </div>
        {errors.initials && <div className="form-error">{errors.initials}</div>}
      </div>

      <div className={`form-row ${errors.measureunit ? "error" : ""}`}>
        <div className="form-label">
          <label>Unidade de Medida:*</label>
        </div>
        <div className="form-input">
          <Input
            value={values.measureunit}
            onChange={({ target }) =>
              setFieldValue("measureunit", target.value)
            }
            maxLength={50}
            placeholder="Ex: mg/dL, UI/L, etc."
          />
        </div>
        {errors.measureunit && (
          <div className="form-error">{errors.measureunit}</div>
        )}
      </div>

      <div className={`form-row ${errors.active ? "error" : ""}`}>
        <div className="form-label">
          <label>Ativo:</label>
        </div>
        <div className="form-input">
          <Switch
            onChange={(active) => setFieldValue("active", active)}
            checked={values.active}
          />
        </div>
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>

      <h3
        style={{
          fontSize: "16px",
          margin: "25px 0 20px 0",
          fontWeight: "600",
        }}
      >
        Valores de Referência
      </h3>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card
            title="Adulto"
            size="small"
            style={{ marginBottom: "16px" }}
            type="inner"
          >
            <div className={`form-row ${errors.min_adult ? "error" : ""}`}>
              <div className="form-label">
                <label>Valor Mínimo:*</label>
              </div>
              <div className="form-input">
                <InputNumber
                  style={{ width: "100%" }}
                  value={values.min_adult}
                  onChange={(value: any) => setFieldValue("min_adult", value)}
                  placeholder="Valor mínimo para adultos"
                />
              </div>
              {errors.min_adult && (
                <div className="form-error">{errors.min_adult}</div>
              )}
            </div>

            <div className={`form-row ${errors.max_adult ? "error" : ""}`}>
              <div className="form-label">
                <label>Valor Máximo:*</label>
              </div>
              <div className="form-input">
                <InputNumber
                  style={{ width: "100%" }}
                  value={values.max_adult}
                  onChange={(value: any) => setFieldValue("max_adult", value)}
                  placeholder="Valor máximo para adultos"
                />
              </div>
              {errors.max_adult && (
                <div className="form-error">{errors.max_adult}</div>
              )}
            </div>

            <div className={`form-row ${errors.ref_adult ? "error" : ""}`}>
              <div className="form-label">
                <label>Referência:*</label>
              </div>
              <div className="form-input">
                <Input
                  value={values.ref_adult}
                  onChange={({ target }) =>
                    setFieldValue("ref_adult", target.value)
                  }
                  maxLength={250}
                  placeholder="Fonte da referência adulta"
                />
              </div>
              {errors.ref_adult && (
                <div className="form-error">{errors.ref_adult}</div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Pediátrico"
            size="small"
            style={{ marginBottom: "16px" }}
            type="inner"
          >
            <div className={`form-row ${errors.min_pediatric ? "error" : ""}`}>
              <div className="form-label">
                <label>Valor Mínimo:*</label>
              </div>
              <div className="form-input">
                <InputNumber
                  style={{ width: "100%" }}
                  value={values.min_pediatric}
                  onChange={(value: any) =>
                    setFieldValue("min_pediatric", value)
                  }
                  placeholder="Valor mínimo para pediátrico"
                />
              </div>
              {errors.min_pediatric && (
                <div className="form-error">{errors.min_pediatric}</div>
              )}
            </div>

            <div className={`form-row ${errors.max_pediatric ? "error" : ""}`}>
              <div className="form-label">
                <label>Valor Máximo:*</label>
              </div>
              <div className="form-input">
                <InputNumber
                  style={{ width: "100%" }}
                  value={values.max_pediatric}
                  onChange={(value: any) =>
                    setFieldValue("max_pediatric", value)
                  }
                  placeholder="Valor máximo para pediátrico"
                />
              </div>
              {errors.max_pediatric && (
                <div className="form-error">{errors.max_pediatric}</div>
              )}
            </div>

            <div className={`form-row ${errors.ref_pediatric ? "error" : ""}`}>
              <div className="form-label">
                <label>Referência:*</label>
              </div>
              <div className="form-input">
                <Input
                  value={values.ref_pediatric}
                  onChange={({ target }) =>
                    setFieldValue("ref_pediatric", target.value)
                  }
                  maxLength={250}
                  placeholder="Fonte da referência pediátrica"
                />
              </div>
              {errors.ref_pediatric && (
                <div className="form-error">{errors.ref_pediatric}</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
