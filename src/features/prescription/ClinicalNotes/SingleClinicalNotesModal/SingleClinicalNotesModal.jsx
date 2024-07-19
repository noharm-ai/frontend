import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";

import {
  getSingleClinicalNotes,
  selectSingleClinicalNotes,
} from "features/prescription/PrescriptionSlice";
import DefaultModal from "components/Modal";
import View from "components/Screening/ClinicalNotes/View";
import FeaturesService from "services/features";

export default function SingleClinicalNotesModal() {
  const dispatch = useDispatch();
  const idClinicalNote = useSelector(
    (state) => state.prescriptionv2.singleClinicalNotes.id
  );
  const data = useSelector(
    (state) => state.prescriptionv2.singleClinicalNotes.data
  );
  const status = useSelector(
    (state) => state.prescriptionv2.singleClinicalNotes.status
  );
  const featureService = FeaturesService([]);

  useEffect(() => {
    if (idClinicalNote) {
      //fetchClinicalNotes(admissionNumber);
      dispatch(getSingleClinicalNotes({ id: idClinicalNote }));
    }
  }, [idClinicalNote]); // eslint-disable-line

  return (
    <DefaultModal
      destroyOnClose
      open={idClinicalNote}
      onCancel={() => dispatch(selectSingleClinicalNotes(null))}
      width="800px"
      footer={null}
      style={{ top: "5px", height: "90vh" }}
    >
      <Spin spinning={status === "loading"}>
        <View
          selected={data}
          featureService={featureService}
          saveStatus={{ isSaving: false }}
          disableSelection={true}
        />
      </Spin>
    </DefaultModal>
  );
}
