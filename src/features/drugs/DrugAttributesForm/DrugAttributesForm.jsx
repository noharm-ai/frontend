import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Spin } from "antd";
import { CheckOutlined } from "@ant-design/icons";

import notification from "components/notification";
import Button from "components/Button";

import {
  fetchDrugAttributes,
  saveDrugAttributes,
} from "./DrugAttributesFormSlice";
import Base from "./Base";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

export default function DrugAttributesForm({ idSegment, idDrug }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.drugAttributesForm.data);
  const status = useSelector((state) => state.drugAttributesForm.status);
  const saveStatus = useSelector(
    (state) => state.drugAttributesForm.saveDrugAttributes.status
  );
  const isLoading = status === "loading" || saveStatus === "loading";

  const validationSchema = Yup.object().shape({
    idDrug: Yup.number().nullable().required(t("validation.requiredField")),
    idSegment: Yup.number().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    idSegment: idSegment,
    idDrug: idDrug,
    ...data,
  };

  useEffect(() => {
    if (idSegment && idDrug) {
      dispatch(fetchDrugAttributes({ idSegment, idDrug }));
    }
  }, [dispatch, idSegment, idDrug]);

  const onSave = (params) => {
    dispatch(saveDrugAttributes(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Atributos atualizados com sucesso!",
        });
      }
    });
  };

  return (
    <Spin spinning={isLoading}>
      <Formik
        enableReinitialize
        onSubmit={onSave}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit} className="highlight-labels">
            <Base data={data} />

            <div className={`form-row`}>
              <div className="form-action-bottom">
                <Button
                  type="primary gtm-bt-save-drug"
                  htmlType="submit"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<CheckOutlined />}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Spin>
  );
}
