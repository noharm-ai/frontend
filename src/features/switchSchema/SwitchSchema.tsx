import { useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Collapse, Card, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "src/store";
import { Select } from "components/Inputs";
import Switch from "components/Switch";
import Feature from "models/Feature";
import Button from "components/Button";
import notification from "components/notification";
import { fetchSwitchSchemaData, switchToSchema } from "./SwitchSchemaSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import { setUser } from "src/store/ducks/auth/thunk";
import { resetReduxState } from "src/store/ducks/reset";

import { SwitchSchemaContainer } from "./SwitchSchema.style";
import { Form } from "styles/Form.style";
import { Brand } from "components/Login/Login.style";

export function SwitchSchema() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.switchSchema.status);
  const switchStatus = useAppSelector(
    (state) => state.switchSchema.switch.status
  );
  const data = useAppSelector((state) => state.switchSchema.data);
  const iptRef = useRef<any>(null);

  console.log("queryparams", queryParams.get("alert"));

  useEffect(() => {
    dispatch(fetchSwitchSchemaData({}));
    if (iptRef && iptRef.current) {
      setTimeout(() => {
        iptRef.current!.focus();
      }, 50);
    }
  }, [dispatch]);

  const validationSchema = Yup.object().shape({
    schema: Yup.string().nullable().required(t("validation.requiredField")),
  });

  const initialValues = {
    schema: localStorage.getItem("schema"),
    getname: false,
    runAsBasicUser: false,
    extraFeatures: [],
  };

  const getExtraOptions = (values: any, setFieldValue: any) => [
    {
      key: "1",
      label: "Mais opções",
      children: (
        <>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Extra Features:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) => {
                  setFieldValue("extraFeatures", value);
                }}
                value={values.extraFeatures}
                optionFilterProp="children"
                showSearch
                mode="multiple"
              >
                <Select.Option
                  key={Feature.DISABLE_CPOE}
                  value={Feature.DISABLE_CPOE}
                >
                  Desabilitar CPOE
                </Select.Option>
                {Feature.getFeatures(t).map((feature) => (
                  <Select.Option key={feature.id} value={feature.id}>
                    {feature.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Ativar Getname:</label>
            </div>
            <div className="form-input">
              <Switch
                onChange={(value) => {
                  setFieldValue("getname", value);
                }}
                checked={values.getname}
              />
            </div>
          </div>
        </>
      ),
    },
  ];

  const onSave = (params: any) => {
    const features = [...params.extraFeatures];
    if (!params.getname) {
      features.push("DISABLE_GETNAME");
    }

    const payload = {
      ...params,
      schema: params.schema,
      extraFeatures: features,
    };

    dispatch(switchToSchema(payload)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        if (response.payload.data) {
          resetReduxState(dispatch);
          setUser(response.payload.data, true, dispatch);

          navigate("/");
        }
      }
    });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors, touched, values, setFieldValue }) => (
        <SwitchSchemaContainer>
          <Brand title="NoHarm.ai | Cuidando dos pacientes" />

          <Form>
            {queryParams?.get("alert") && (
              <Alert
                message="Lembre-se de fechar as outras abas"
                showIcon
                description="Ao trocar o schema, as outras abas abertas serão atualizadas para o novo schema. Isto pode gerar comportamentos inesperados."
                type="warning"
                style={{ marginBottom: "15px" }}
              />
            )}
            <Card>
              <div
                className={`form-row ${
                  errors.schema && touched.schema ? "error" : ""
                }`}
              >
                <div className="form-label">
                  <label>
                    {data?.maintainer
                      ? "Escolha o schema"
                      : "Escolha o contexto"}
                    :
                  </label>
                </div>
                <div className="form-input">
                  <Select
                    onChange={(value) => {
                      setFieldValue("schema", value);
                    }}
                    value={values.schema}
                    status={errors.schema && touched.schema ? "error" : ""}
                    optionFilterProp="children"
                    showSearch
                    size="large"
                    ref={iptRef}
                  >
                    {data?.schemas &&
                      data.schemas.map(({ name, friendlyName }: any) => (
                        <Select.Option key={name} value={name}>
                          {data?.maintainer ? name : friendlyName}
                        </Select.Option>
                      ))}
                  </Select>
                </div>
                {errors.schema && touched.schema && (
                  <div className="form-error">{errors.schema}</div>
                )}
              </div>

              {data?.maintainer && (
                <Collapse
                  ghost
                  className="collapsed-content"
                  items={getExtraOptions(values, setFieldValue)}
                />
              )}
            </Card>
            <Button
              type="primary"
              block
              loading={status === "loading" || switchStatus === "loading"}
              onClick={() => handleSubmit()}
              size="large"
              className="gtm-btn-login"
            >
              Definir {data?.maintainer ? "schema" : "contexto"}
            </Button>
          </Form>
        </SwitchSchemaContainer>
      )}
    </Formik>
  );
}
