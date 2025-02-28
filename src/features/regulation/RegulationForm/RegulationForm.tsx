import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Dayjs } from "dayjs";
import { Result } from "antd";

import { useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import notification from "components/notification";
import {
  createSolicitation,
  setRegulationFormModal,
} from "./RegulationFormSlice";
import { RegulationFormBase } from "./RegulationFormBase";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { useAppSelector } from "src/store";

export interface IRegulationFormBaseFields {
  idPatient?: number;
  idDepartment?: number;
  idRegSolicitationType?: number;
  typeType?: number;
  solicitationDate?: Dayjs;
  risk?: number;
  attendant?: string;
  attendantRecord?: string;
  justification?: string;
}

export function RegulationForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.regulation.regulationForm.modal);
  const status = useAppSelector(
    (state) => state.regulation.regulationForm.status
  );
  const namesList = useAppSelector((state) => state.lists.searchNames.list);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    idPatient: Yup.number().required(t("validation.requiredField")),
    idDepartment: Yup.number().required(t("validation.requiredField")),
    idRegSolicitationType: Yup.number().required(t("validation.requiredField")),
    solicitationDate: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    risk: Yup.number().required(t("validation.requiredField")),
    justification: Yup.string().required(t("validation.requiredField")),
  });
  const initialValues: IRegulationFormBaseFields = {};

  const onSave = (
    params: IRegulationFormBaseFields,
    formikHelpers: FormikHelpers<IRegulationFormBaseFields>
  ) => {
    const payload = {
      idPatient: params.idPatient!,
      birthdate: null,
      idDepartment: params.idDepartment!,
      solicitationDate: params.solicitationDate!.format("YYYY-MM-DDTHH:mm:ss"),
      idRegSolicitationType: params.idRegSolicitationType!,
      risk: params.risk!,
      attendant: params.attendant,
      attendantRecord: params.attendantRecord,
      justification: params.justification!,
    };

    const name: any = namesList.find(
      (i: any) => i.idPatient === payload.idPatient
    );

    if (name) {
      payload.birthdate = name.birthdate;
    }

    dispatch(createSolicitation(payload)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        formikHelpers.resetForm();
        dispatch(setRegulationFormModal(false));
        const solicitationId = response.payload.data?.data?.id;

        DefaultModal.info({
          content: (
            <Result
              status="success"
              title="Solicitação criada com sucesso"
              subTitle={
                <div style={{ color: "rgba(0, 0, 0, 0.7)" }}>
                  <p>
                    O número da solicitação é:
                    <strong>{solicitationId}</strong>.
                  </p>
                </div>
              }
              extra={[
                <Button
                  type="primary"
                  onClick={() =>
                    window.open(`/regulacao/${solicitationId}`, "_blank")
                  }
                  key={1}
                >
                  Abrir solicitação
                </Button>,
              ]}
            />
          ),
          icon: null,
          width: 400,
          okText: "Fechar",
          okButtonProps: { type: "default" },
          wrapClassName: "default-modal",
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setRegulationFormModal(false));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={() => handleSubmit()}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
          maskClosable={false}
        >
          <h2 className="modal-title">Criar Solicitação</h2>

          <Form onSubmit={handleSubmit}>
            <RegulationFormBase />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
