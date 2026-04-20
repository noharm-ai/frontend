import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";

import { setSegment, upsertSegment } from "../SegmentSlice";
import Base from "./Base";

function SegmentForm({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const integrationStatus = useSelector(
    (state) => state.app.config.integrationStatus,
  );
  const formData = useSelector((state) => state.admin.segment.single.data);
  const status = useSelector(
    (state) => state.admin.segment.upsertSegment.status,
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    type: Yup.number().nullable().required(t("validation.requiredField")),
    idSegmentOrigin: Yup.number()
      .nullable()
      .when("idSegment", {
        is: (val) => !val,
        then: (schema) => schema.required(t("validation.requiredField")),
        otherwise: (schema) => schema.nullable(),
      }),
  });
  const initialValues = {
    idSegmentOrigin: null,
    ...formData,
  };

  const onSave = (params) => {
    const isNew = !formData?.idSegment;
    dispatch(upsertSegment(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setSegment(null));
        dispatch(fetchSegmentsListThunk({ clearCache: true }));
        setOpen(false);

        if (isNew) {
          DefaultModal.success({
            title: "Segmento criado com sucesso!",
            content: (
              <div>
                <p>
                  Para que o segmento funcione corretamente, siga os próximos
                  passos:
                </p>
                <ol>
                  <li>
                    <strong>Adicione setores</strong> ao segmento para definir
                    quais farão parte dele.
                  </li>
                  <li>
                    <strong>Gere os escores</strong> após configurar os setores
                    para corrigir os escores dos medicamentos.
                  </li>
                </ol>
              </div>
            ),
            okText: "Entendido",
            width: 500,
          });
        } else {
          notification.success({
            message: t("success.generic"),
          });
        }
      }
    });
  };

  const onCancel = () => {
    dispatch(setSegment(null));
    setOpen(false);
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={500}
          centered
          destroyOnHidden
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
        >
          <header>
            <Heading $margin="0 0 11px">Segmento</Heading>
          </header>

          {formData && !formData.idSegment && integrationStatus === 1 && (
            <Alert
              showIcon
              type="warning"
              message="Atenção"
              description="Ao criar um novo segmento em um schema que já está em produção, você deve acionar a equipe de curadoria para configurá-lo."
            />
          )}

          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default SegmentForm;
