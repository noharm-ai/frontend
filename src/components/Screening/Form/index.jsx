import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import CustomForm from "components/Forms/CustomForm";

export default function DrugForm({
  savePrescriptionDrugForm,
  idPrescriptionDrug,
  template,
  values,
}) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const saveForm = (data) => {
    setLoading(true);

    savePrescriptionDrugForm(idPrescriptionDrug, {
      form: { ...data.values, updated: true },
    })
      .then(() => {
        setLoading(false);
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

  return (
    <CustomForm
      onSubmit={saveForm}
      template={template.data}
      isSaving={loading}
      values={values}
      horizontal
    />
  );
}
