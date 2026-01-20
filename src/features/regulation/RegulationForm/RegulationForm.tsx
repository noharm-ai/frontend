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
  idRegSolicitationTypeList?: number;
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
    idRegSolicitationTypeList: Yup.array()
      .of(Yup.number())
      .required(t("validation.requiredField")),
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
      idRegSolicitationTypeList: params.idRegSolicitationTypeList!,
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
        const resultsIds = response.payload.data?.data?.idList;
        const actions = [];

        if (resultsIds.length === 1) {
          actions.push(
            <Button
              type="primary"
              onClick={() =>
                window.open(`/regulacao/${resultsIds[0]}`, "_blank")
              }
              key={1}
            >
              Abrir solicitação
            </Button>
          );
        }

        DefaultModal.info({
          content: (
            <Result
              status="success"
              title="Solicitação criada com sucesso"
              subTitle={
                <div style={{ color: "rgba(0, 0, 0, 0.7)" }}>
                  {resultsIds.length > 1 ? (
                    <p>Múltiplas solicitações foram criadas.</p>
                  ) : (
                    <p>
                      O número da solicitação é:{" "}
                      <strong>{resultsIds[0]}</strong>.
                    </p>
                  )}
                </div>
              }
              extra={actions}
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
          destroyOnHidden
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
