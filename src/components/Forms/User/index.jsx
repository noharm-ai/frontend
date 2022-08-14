import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Row } from "components/Grid";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";

import Base from "./Base";
import { FormContainer } from "../Form.style";

export default function User({
  saveStatus,
  save,
  afterSave,
  user,
  security,
  ...props
}) {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string()
      .email(t("userAdminForm.emailError"))
      .required(t("userAdminForm.requiredError")),
  });

  const { isSaving } = saveStatus;
  const { ...data } = user.content;

  const initialValues = {
    ...data,
  };

  const submit = (params) => {
    save(params)
      .then(() => {
        notification.success({
          message: t("userAdminForm.saveMessage"),
        });
        if (afterSave) {
          afterSave();
        }
      })
      .catch((err) => {
        console.error(err);
        notification.error({
          message: t("userAdminForm.errorMessage"),
          description: t(err.code),
        });
      });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          width={700}
          centered
          destroyOnClose
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-edit-user",
          }}
        >
          <header>
            <Heading margin="0 0 11px">{t("menu.userConfig")}</Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base security={security} />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}

User.defaultProps = {
  afterSave: () => {},
  initialValues: {
    email: "",
    name: "",
    external: "",
    id: "",
    active: true,
    roles: [],
  },
};
