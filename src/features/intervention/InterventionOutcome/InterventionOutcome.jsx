import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Spin, Alert, Space } from "antd";
import { EditOutlined, RollbackOutlined } from "@ant-design/icons";

import notification from "components/notification";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import {
  fetchInterventionOutcomeData,
  setInterventionOutcome,
  setSelectedIntervention,
  reset,
} from "./InterventionOutcomeSlice";
import { updateInterventionStatusThunk } from "store/ducks/prescriptions/thunk";
import { updateInterventionListStatusThunk } from "store/ducks/intervention/thunk";
import InterventionOutcomeForm from "./Form/InterventionOutcomeForm";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";
import { ModalFooter } from "styles/Utils.style";

export default function InterventionOutcome({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedIntervention = useSelector(
    (state) => state.interventionOutcome.selectedIntervention
  );
  const outcomeData = useSelector((state) => state.interventionOutcome.data);

  const loadStatus = useSelector((state) => state.interventionOutcome.status);
  const saveStatus = useSelector(
    (state) => state.interventionOutcome.save.status
  );

  const isLoading = saveStatus === "loading" || loadStatus === "loading";
  const isInvalid =
    selectedIntervention.view &&
    ["s", "0"].indexOf(outcomeData?.header?.status) !== -1;

  useEffect(() => {
    if (selectedIntervention.open) {
      dispatch(
        fetchInterventionOutcomeData({
          idIntervention: selectedIntervention.idIntervention,
        })
      );
    } else {
      dispatch(reset());
    }
  }, [
    dispatch,
    selectedIntervention.open,
    selectedIntervention.idIntervention,
  ]);

  const initialValues = {
    idIntervention: outcomeData.idIntervention,
    outcome: selectedIntervention.outcome,
    origin: outcomeData.origin?.item || {},
    idPrescriptionDrugDestiny:
      outcomeData.destiny?.length > 0
        ? outcomeData.destiny[0].item.idPrescriptionDrug
        : null,
    destiny: outcomeData.destiny?.length > 0 ? outcomeData.destiny[0].item : {},
    economyDayValueManual: outcomeData.header?.economyDayValueManual,
    economyDayValue: outcomeData.header?.economyDayValue,
    economyDayAmountManual: outcomeData.header?.economyDayAmountManual,
    economyDayAmount: outcomeData.header?.economyDayAmount,
  };

  const validationSchema = Yup.object().shape({
    idIntervention: Yup.number()
      .nullable()
      .required(t("validation.requiredField")),
    outcome: Yup.string().nullable().required(t("validation.requiredField")),
  });

  const onSave = (params) => {
    dispatch(setInterventionOutcome(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(
          updateInterventionStatusThunk(
            selectedIntervention.idIntervention,
            selectedIntervention.outcome
          )
        );

        dispatch(
          updateInterventionListStatusThunk(
            selectedIntervention.idIntervention,
            selectedIntervention.outcome
          )
        );

        onCancel();

        notification.success({
          message: "Desfecho aplicado com sucesso!",
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(
      setSelectedIntervention({
        open: false,
        idIntervention: null,
        outcome: null,
      })
    );
  };

  const Footer = ({ handleSubmit }) => {
    if (isInvalid) {
      return (
        <ModalFooter>
          <Button
            onClick={() => onCancel()}
            disabled={isLoading}
            loading={isLoading}
          >
            {t("interventionForm.btnCancel")}
          </Button>
        </ModalFooter>
      );
    }

    const saveItems = [
      {
        label: "Alterar e marcar como Aceita",
        key: "a",
      },
      {
        label: "Alterar e marcar como Não Aceita",
        key: "n",
      },
      {
        label: "Alterar e marcar como Não Aceita com Justificativa",
        key: "j",
      },
      {
        label: "Alterar e marcar como Não se Aplica",
        key: "x",
      },
    ];

    const onMenuClick = ({ key }) => {
      dispatch(
        setSelectedIntervention({
          open: true,
          idIntervention: selectedIntervention.idIntervention,
          outcome: key,
          view: false,
          editAlert: true,
        })
      );

      dispatch(
        fetchInterventionOutcomeData({
          idIntervention: selectedIntervention.idIntervention,
          edit: true,
        })
      );
    };

    return (
      <ModalFooter>
        <Button
          onClick={() => onCancel()}
          disabled={isLoading}
          loading={isLoading}
        >
          {t("interventionForm.btnCancel")}
        </Button>
        {selectedIntervention.view ? (
          <Dropdown
            loading={isLoading}
            disabled={isLoading}
            ghost
            menu={{
              items: saveItems,
              onClick: onMenuClick,
            }}
          >
            <Button
              danger
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              ghost
              loading={isLoading}
            >
              Alterar
            </Button>
          </Dropdown>
        ) : (
          <>
            {selectedIntervention.outcome === "s" ? (
              <Button
                danger
                icon={<RollbackOutlined style={{ fontSize: 16 }} />}
                ghost
                loading={isLoading}
                onClick={() => handleSubmit()}
              >
                Desfazer desfecho
              </Button>
            ) : (
              <Button
                type="primary"
                loading={isLoading}
                onClick={() => handleSubmit()}
              >
                Confirmar desfecho
              </Button>
            )}
          </>
        )}
      </ModalFooter>
    );
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
          open={selectedIntervention.open}
          width={
            outcomeData.header?.economyType == null
              ? 400
              : outcomeData.header?.economyType === 2
              ? 800
              : 600
          }
          footer={<Footer handleSubmit={handleSubmit} />}
          centered
          onCancel={onCancel}
          destroyOnClose
          maskClosable={false}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px" size="18px">
              {selectedIntervention.view ? (
                <>Detalhes da Intervenção</>
              ) : (
                <>
                  {t(
                    `interventionStatusAction.${selectedIntervention.outcome}`
                  )}
                </>
              )}
            </Heading>
          </header>

          <Spin spinning={loadStatus === "loading"}>
            {isInvalid ? (
              <Alert
                type="error"
                showIcon
                message="Esta intervenção está pendente."
              ></Alert>
            ) : (
              <Form onSubmit={handleSubmit} className="highlight-labels">
                <InterventionOutcomeForm />
              </Form>
            )}
          </Spin>

          {selectedIntervention.editAlert && (
            <Space direction="vertical">
              <Alert
                type="info"
                showIcon
                message="Alterações feitas na intervenção só estarão disponíveis no relatório do dia seguinte."
              ></Alert>
              {selectedIntervention.reportUpdatedAt &&
                selectedIntervention.reportUpdatedAt <
                  outcomeData?.header?.updatedAt && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Esta intervenção possui alterações feitas após a data de geração deste relatório. Aguarde o dia seguinte para visualizá-las."
                  ></Alert>
                )}
            </Space>
          )}
        </DefaultModal>
      )}
    </Formik>
  );
}
