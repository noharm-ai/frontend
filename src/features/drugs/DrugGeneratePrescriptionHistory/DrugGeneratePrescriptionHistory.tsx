import { useState } from "react";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Alert from "components/Alert";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch, useAppSelector } from "store/index";
import {
  addPrescriptionHistory,
  setDrugGeneratePrescriptionHistoryOpen,
} from "./DrugGeneratePrescriptionHistorySlice";

interface DrugGeneratePrescriptionHistoryProps {
  onAfterSave?: () => void;
}

export function DrugGeneratePrescriptionHistory({
  onAfterSave,
}: DrugGeneratePrescriptionHistoryProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(
    (state) => state.drugGeneratePrescriptionHistory.open,
  );
  const idDrug = useAppSelector(
    (state) => state.drugGeneratePrescriptionHistory.idDrug,
  );
  const idSegment = useAppSelector(
    (state) => state.drugGeneratePrescriptionHistory.idSegment,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onCancel = () => {
    dispatch(setDrugGeneratePrescriptionHistoryOpen({ open: false }));
    setError(false);
  };

  const confirm = () => {
    if (!idDrug || idSegment == null) return;

    setLoading(true);

    dispatch(addPrescriptionHistory({ idDrug, idSegment })).then(
      (response: any) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          if (response.payload.data > 0) {
            notification.success({
              message: "Histórico de Prescrição gerado com sucesso!",
            });

            dispatch(setDrugGeneratePrescriptionHistoryOpen({ open: false }));

            onAfterSave?.();
          } else {
            setError(true);
          }
        }

        setLoading(false);
      },
    );
  };

  if (!open) {
    return null;
  }

  return (
    <DefaultModal
      open={open}
      width={500}
      centered
      destroyOnHidden
      onCancel={onCancel}
      onOk={confirm}
      okText={"Confirmar"}
      cancelText={t("actions.close")}
      confirmLoading={loading}
      okButtonProps={{
        loading: loading,
        disabled: error,
      }}
      cancelButtonProps={{
        loading: loading,
      }}
      maskClosable={false}
      closable={false}
    >
      <header>
        <Heading style={{ fontSize: "20px" }}>
          Gerar Histórico de Prescrição
        </Heading>
      </header>

      {error ? (
        <Alert
          message="Não foi possível gerar o histórico"
          description="Este medicamento não possui registro de prescrição no último ano."
          type="error"
          showIcon
        />
      ) : (
        <>
          <p>
            Confirma a geração de histórico de prescrição para este medicamento?
          </p>
          <ul>
            <li>O histórico atual, se existir, será removido.</li>
            <li>
              Será contabilizado 1 ano de prescrições deste medicamento neste
              segmento.
            </li>
          </ul>
        </>
      )}
    </DefaultModal>
  );
}
