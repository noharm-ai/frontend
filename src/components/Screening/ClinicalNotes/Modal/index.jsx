import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import ClinicalNotes from "containers/Screening/ClinicalNotes";

export default function Modal({
  fetchClinicalNotes,
  admissionNumber,
  visible,
  setModalVisibility,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      fetchClinicalNotes(admissionNumber);
    }
  }, [visible, admissionNumber]); // eslint-disable-line

  return (
    <DefaultModal
      title={t("tableHeader.clinicalNotes")}
      destroyOnHidden
      open={!!visible}
      onCancel={() => setModalVisibility("clinicalNotes", false)}
      width="90%"
      footer={null}
      style={{ top: "10px", height: "100vh" }}
      styles={{ body: { padding: 0 } }}
    >
      <ClinicalNotes visibleState={visible} />
    </DefaultModal>
  );
}
