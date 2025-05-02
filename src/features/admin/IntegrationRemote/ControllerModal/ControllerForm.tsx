import { Formik } from "formik";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Tag, Alert } from "antd";

import { Textarea } from "src/components/Inputs";
import Button from "src/components/Button";
import { Form } from "src/styles/Form.style";

interface IControllerFormProps {
  controllerData: any;
  controllerStatus: any;
  saveControllerData: (data: any) => void;
}

export function ControllerForm({
  controllerData,
  controllerStatus,
  saveControllerData,
}: IControllerFormProps) {
  const initialValues = {
    "Database Connection URL":
      controllerData?.component?.properties?.["Database Connection URL"] || "",
    "Max Wait Time":
      controllerData?.component?.properties?.["Max Wait Time"] || "",
    "Max Total Connections":
      controllerData?.component?.properties?.["Max Total Connections"] || "",
  };

  const onSubmit = (params: any) => {
    saveControllerData(params);
  };

  const hasProp = (object: any, prop: string) =>
    Object.prototype.hasOwnProperty.call(object, prop);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, setFieldValue, values }) => (
        <>
          {controllerStatus?.runStatus === "ENABLED" && (
            <Alert
              type="error"
              message="O controller não pode ser alterado enquanto estiver habilitado."
              style={{ marginBottom: "25px" }}
            ></Alert>
          )}
          <Form>
            <div className={`form-row`}>
              <div className="form-label">
                <label>Nome:</label>
              </div>
              <div className="form-input">
                {controllerData?.component?.name}
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Situação</label>
              </div>
              <div className="form-input">
                {controllerStatus?.runStatus === "ENABLED" ? (
                  <Tag color="success">Habilitado</Tag>
                ) : (
                  <Tag>Desabilitado</Tag>
                )}
                <br />
                {controllerStatus?.validationStatus === "VALID"
                  ? ""
                  : "Controller inválido (verifique as configurações)"}
              </div>
            </div>

            {hasProp(
              controllerData?.component?.properties,
              "Database Connection URL"
            ) && (
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Database Connection URL:</label>
                </div>
                <div className="form-input">
                  <Textarea
                    value={values["Database Connection URL"]}
                    style={{ height: "6rem" }}
                    onChange={({ target }) =>
                      setFieldValue("Database Connection URL", target.value)
                    }
                  />
                </div>
              </div>
            )}

            {hasProp(
              controllerData?.component?.properties,
              "Max Wait Time"
            ) && (
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Max Wait Time:</label>
                </div>
                <div className="form-input">
                  <Textarea
                    value={values["Max Wait Time"]}
                    style={{ height: "3rem" }}
                    onChange={({ target }) =>
                      setFieldValue("Max Wait Time", target.value)
                    }
                  />
                </div>
              </div>
            )}

            {hasProp(
              controllerData?.component?.properties,
              "Max Total Connections"
            ) && (
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Max Total Connections:</label>
                </div>
                <div className="form-input">
                  <Textarea
                    value={values["Max Total Connections"]}
                    style={{ height: "3rem" }}
                    onChange={({ target }) =>
                      setFieldValue("Max Total Connections", target.value)
                    }
                  />
                </div>
              </div>
            )}

            <div className="form-action" style={{ marginTop: "2rem" }}>
              {controllerStatus?.runStatus === "DISABLED" && (
                <Button
                  type="primary"
                  onClick={() => handleSubmit()}
                  icon={<ArrowRightOutlined />}
                >
                  Salvar
                </Button>
              )}
            </div>
          </Form>
        </>
      )}
    </Formik>
  );
}
