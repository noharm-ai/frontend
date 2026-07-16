import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";
import { Spin, Alert } from "antd";

import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Button from "components/Button";

import { Form } from "styles/Form.style";

import { setSubstance } from "../SubstanceFormSlice";
import Base from "./Base";

export default function SubstanceForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.admin.substanceForm.data);
  const fetchStatus = useSelector(
    (state) => state.admin.substanceForm.fetchStatus
  );
  const isFetching = fetchStatus === "loading";

  const initialValues = {
    ...formData,
  };

  const onCancel = () => {
    dispatch(setSubstance(null));
  };

  return (
    <Formik enableReinitialize initialValues={initialValues}>
      {() => (
        <DefaultModal
          open={formData}
          width={700}
          centered
          destroyOnHidden
          onCancel={onCancel}
          footer={[
            <Button key="close" onClick={onCancel}>
              {t("actions.close")}
            </Button>,
          ]}
          {...props}
        >
          <header>
            <Heading
              style={{
                fontSize: "16px",
                lineHeight: "1.3rem",
                paddingRight: "1rem",
              }}
            >
              {formData?.name}
            </Heading>
          </header>

          <Alert
            showIcon
            type="warning"
            message="Atenção"
            description="Esta tela é somente para consulta. A edição de substâncias foi migrada para o projeto Admin e deve ser feita por lá."
            style={{ marginBottom: "1rem" }}
          />

          <Form>
            <Spin spinning={isFetching}>
              <Base open={formData} disabled />
            </Spin>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
