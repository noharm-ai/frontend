import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Alert from "components/Alert";
import { getErrorMessage } from "utils/errorHandler";
import { fetchReferencesListThunk } from "store/ducks/outliers/thunk";
import { fetchDrugsUnitsListThunk } from "store/ducks/drugs/thunk";

import { addHistory } from "../ScoreWizardSlice";

function GeneratePrescriptionHistory({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDrug = useSelector((state) => state.outliers.firstFilter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onCancel = () => {
    setOpen(false);
    setError(false);
  };

  const confirm = () => {
    setLoading(true);
    const payload = {
      idSegment: currentDrug.idSegment,
      idDrug: currentDrug.idDrug,
    };

    dispatch(addHistory(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        if (response.payload.data > 0) {
          notification.success({
            message: "Histórico de Prescrição gerado com sucesso!",
          });

          setOpen(false);

          dispatch(
            fetchReferencesListThunk(currentDrug.idSegment, currentDrug.idDrug),
          );

          dispatch(
            fetchDrugsUnitsListThunk({
              id: currentDrug.idDrug,
              idSegment: currentDrug.idSegment,
            }),
          );
        } else {
          setError(true);
        }
      }

      setLoading(false);
    });
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

export default GeneratePrescriptionHistory;
