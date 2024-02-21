import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import notification from "components/notification";
import CustomForm from "components/Forms/CustomForm";

import { updateDrugForm } from "features/drugs/DrugFormStatus/DrugFormStatusSlice";

export default function DrugForm({
  savePrescriptionDrugForm,
  idPrescriptionDrug,
  template,
  values,
}) {
  const [loading, setLoading] = useState(false);
  const [updatedAtState, setUpdatedAtState] = useState(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const saveForm = (data) => {
    setLoading(true);
    const updatedAt = dayjs().toISOString();

    savePrescriptionDrugForm(idPrescriptionDrug, {
      form: { ...data.values, updated: true, updatedAt },
    })
      .then(() => {
        setLoading(false);
        setUpdatedAtState(updatedAt);
        dispatch(
          updateDrugForm({
            id: idPrescriptionDrug,
            data: {
              ...data.values,
              updated: true,
              updatedAt,
            },
          })
        );
        notification.success({
          message: t("success.generic"),
        });
      })
      .catch((err) => {
        setLoading(false);
        console.error("err", err);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const onChangeForm = (values) => {
    dispatch(
      updateDrugForm({
        id: idPrescriptionDrug,
        data: { ...values, updated: false },
      })
    );
  };

  return (
    <>
      <CustomForm
        onSubmit={saveForm}
        template={template.data}
        isSaving={loading}
        values={values}
        horizontal
        onChange={onChangeForm}
        btnSaveText={"Avaliar"}
      />
      {(values?.updated || updatedAtState) && (
        <div style={{ marginTop: "10px" }}>
          {values?.updatedAt || updatedAtState ? (
            <>
              <CheckOutlined /> Avaliado em:{" "}
              {dayjs(updatedAtState || values?.updatedAt).format(
                "DD/MM/YYYY HH:mm"
              )}
            </>
          ) : (
            <>
              <CheckOutlined /> Avaliado
            </>
          )}
        </div>
      )}
    </>
  );
}
