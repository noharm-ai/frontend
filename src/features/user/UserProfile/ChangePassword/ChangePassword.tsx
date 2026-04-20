import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { CheckOutlined } from "@ant-design/icons";

import { Row } from "components/Grid";
import { ButtonContainer, FormContainer } from "components/Forms/Form.style";
import Button from "components/Button";
import Card from "components/Card";
import notification from "components/notification";
import { passwordValidation } from "utils/index";
import { useAppDispatch, useAppSelector } from "store/index";
import { getErrorMessage } from "src/utils/errorHandler";

import { updatePassword } from "../UserProfileSlice";
import { Base } from "./Base";

const requiredFieldMessage = "Campo obrigatório";
const validationSchema = Yup.object().shape({
  password: Yup.string().required(requiredFieldMessage),
  newpassword: Yup.string()
    .required(requiredFieldMessage)
    .matches(passwordValidation.regex, passwordValidation.message),
  confirmPassword: Yup.string()
    .required(requiredFieldMessage)
    .oneOf([Yup.ref("newpassword"), null], "Senhas não conferem"),
});

export function ChangePassword() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(
    (state) => state.userProfile.changePassword,
  );
  const isSaving = status === "loading";
  const success = status === "succeeded";

  const initialValues = {
    password: "",
    newpassword: "",
    confirmPassword: "",
  };

  const save = (values: {
    password: string;
    newpassword: string;
    confirmPassword: string;
  }) => {
    dispatch(updatePassword(values)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Uhu! Senha alterada com sucesso! :)",
        });
      }
    });
  };

  return (
    <Card title="Alterar senha">
      <Formik
        enableReinitialize
        onSubmit={save}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row gutter={[16, 24]}>
                <Base success={success} />
              </Row>
              <ButtonContainer style={{ paddingTop: "10px" }}>
                <Button
                  type="primary"
                  className="gtm-btn-save-password"
                  onClick={() => handleSubmit()}
                  loading={isSaving}
                  disabled={isSaving}
                  icon={<CheckOutlined />}
                >
                  Salvar
                </Button>
              </ButtonContainer>
            </FormContainer>
          </form>
        )}
      </Formik>
    </Card>
  );
}
