import { Skeleton, Space } from "antd";
import { Formik } from "formik";
import { SendOutlined } from "@ant-design/icons";

import { useAppSelector, useAppDispatch } from "src/store";
import Button from "src/components/Button";
import { SupportField } from "./SupportField";
import { resetAIForm } from "../../SupportSlice";

import { Form } from "src/styles/Form.style";

export function SupportForm() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.support.aiform.n0form.status);
  const data: any = useAppSelector((state) => state.support.aiform.n0form.data);

  const sendTicket = (params: any) => {
    console.log("Sending ticket with params:", params);
  };

  const cancel = () => {
    console.log("Canceling ticket creation");
    dispatch(resetAIForm());
  };

  const initialValues: any = {};
  if (data && data.extra_fields) {
    data.extra_fields.forEach((field: any) => {
      initialValues[field.label] = "";
    });
  }

  return (
    <div>
      {status === "loading" && <Skeleton active paragraph={{ rows: 4 }} />}
      {status === "succeeded" && (
        <div>
          <h3>Por favor, forneça mais algumas informações:</h3>
          <Formik
            enableReinitialize
            onSubmit={sendTicket}
            initialValues={initialValues}
          >
            {({ handleSubmit, errors, touched, values, setFieldValue }) => (
              <Form>
                <div className="form-intro" style={{ fontSize: "15px" }}>
                  <p>
                    Preencha os campos abaixo para abrir um chamado. Quanto mais
                    informações você fornecer, melhor poderemos te ajudar.
                  </p>
                </div>

                {data.extra_fields &&
                  data.extra_fields.map((field: any) => (
                    <div
                      key={field.label}
                      className={`form-row ${
                        errors[field.label] && touched[field.label]
                          ? "error"
                          : ""
                      }`}
                    >
                      <div className="form-label">
                        <label>{field.label}:</label>
                      </div>
                      <div className="form-input">
                        <SupportField
                          label={field.label}
                          type={field.type}
                          setFieldValue={setFieldValue}
                          value={values[field.label]}
                        />
                      </div>
                    </div>
                  ))}

                <div className={`form-row`}>
                  <div className="form-action-bottom">
                    <Space>
                      <Button onClick={() => cancel()}>Cancelar</Button>
                      <Button
                        type="primary"
                        onClick={() => handleSubmit()}
                        icon={<SendOutlined />}
                      >
                        Abrir chamado
                      </Button>
                    </Space>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
      {status === "failed" && <p>Error fetching response.</p>}
    </div>
  );
}
