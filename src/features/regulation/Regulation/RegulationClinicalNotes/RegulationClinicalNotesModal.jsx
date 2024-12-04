import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import ClinicalNotes from "./RegulationClinicalNotes";
import { fetchClinicalNotesListThunk } from "store/ducks/clinicalNotes/thunk";
import { setClinicalNotesModal } from "../RegulationSlice";

export default function RegulationClinicalNotesModal() {
  const dispatch = useDispatch();
  const open = useSelector(
    (state) => state.regulation.regulation.modal.clinicalNotes
  );
  const admissionNumber = useSelector(
    (state) => state.regulation.regulation.data.admissionNumber
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      dispatch(fetchClinicalNotesListThunk(admissionNumber));
    }
  }, [open, admissionNumber, dispatch]);

  return (
    <DefaultModal
      title={t("tableHeader.clinicalNotes")}
      destroyOnClose
      open={open}
      onCancel={() => dispatch(setClinicalNotesModal(false))}
      width="90%"
      footer={null}
      style={{ top: "10px", height: "100vh" }}
      styles={{ body: { padding: 0 } }}
    >
      <ClinicalNotes />
    </DefaultModal>
  );
}
