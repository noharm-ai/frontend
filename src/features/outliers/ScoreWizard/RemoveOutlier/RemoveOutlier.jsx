import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";

import { removeOutlier } from "../ScoreWizardSlice";

function RemoveOutlier({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDrug = useSelector((state) => state.outliers.firstFilter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
    }
  }, [open]);

  const onCancel = () => {
    setOpen(false);
  };

  const confirm = () => {
    setLoading(true);
    const payload = {
      idSegment: currentDrug.idSegment,
      idDrug: currentDrug.idDrug,
    };

    dispatch(removeOutlier(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Outlier removido com sucesso! A página será atualizada.",
        });

        setTimeout(() => {
          window.location.href = "/medicamentos";
        }, 300);
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
      }}
      cancelButtonProps={{
        loading: loading,
      }}
      maskClosable={false}
      closable={false}
    >
      <header>
        <Heading style={{ fontSize: "20px" }}>Remover Outlier</Heading>
      </header>

      <>
        <p>Confirma a remoção deste registro?</p>
        <p>
          Esta ação remove apenas o registro de escore deste medicamento. Desta
          forma, ele não aparecerá na lista da curadoria.
        </p>
      </>
    </DefaultModal>
  );
}

export default RemoveOutlier;
