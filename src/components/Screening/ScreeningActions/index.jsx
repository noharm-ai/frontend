import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MenuOutlined,
  UserOutlined,
  CloseOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import { FloatButton } from "antd";

import DefaultModal from "components/Modal";

import FormPatientModal from "containers/Forms/Patient";
import { shouldUpdatePrescription } from "features/serverActions/ServerActionsSlice";
import InterventionOutcome from "features/intervention/InterventionOutcome/InterventionOutcome";
import CheckSummary from "features/prescription/CheckSummary/CheckSummary";
import SingleClinicalNotesModal from "features/prescription/ClinicalNotes/SingleClinicalNotesModal/SingleClinicalNotesModal";
import FeaturesService from "services/features";
import {
  setChooseConciliationModal,
  setCheckedIndexReport,
} from "features/prescription/PrescriptionSlice";
import ChooseConciliation from "features/prescription/ChooseConciliation/ChooseConciliation";
import ExamsModal from "features/exams/ExamModal/ExamModal";
import ClinicalNotesModal from "containers/Screening/ClinicalNotes/Modal";
import { CheckedIndexReport } from "src/features/reports/CheckedIndexReport/CheckedIndexReport";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

import { ScreeningFloatButtonGroup } from "../index.style";

export default function ScreeningActions({
  fetchScreening,
  prescription,
  setModalVisibility,
  patientEditVisible,
  features,
  checkScreening,
  interventions,
}) {
  const dispatch = useDispatch();
  const checkedIndexReport = useSelector(
    (state) => state.prescriptionv2.checkedIndexReport,
  );
  const featureService = FeaturesService(features);

  const afterSavePatient = (response) => {
    if (response.updatePrescription) {
      dispatch(
        shouldUpdatePrescription({
          idPrescription: prescription.idPrescription,
        }),
      ).then(() => {
        fetchScreening(prescription.idPrescription);
        setModalVisibility("patientEdit", false);
      });
    } else {
      fetchScreening(prescription.idPrescription);
      setModalVisibility("patientEdit", false);
    }
  };

  const addConciliation = () => {
    dispatch(setChooseConciliationModal(prescription.admissionNumber));
  };

  return (
    <>
      {prescription.idPrescription && (
        <ScreeningFloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip={{ title: "Menu", placement: "left" }}
          style={{ bottom: 25 }}
          onClick={() =>
            trackPrescriptionAction(TrackedPrescriptionAction.CLICK_FLOAT_MENU)
          }
        >
          <FloatButton
            icon={<CloseOutlined />}
            onClick={() => window.close()}
            tooltip={{ title: "Fechar prescrição", placement: "left" }}
          />
          <FloatButton
            onClick={() => setModalVisibility("patientEdit", true)}
            icon={<UserOutlined />}
            tooltip={{ title: "Editar dados do paciente", placement: "left" }}
          />
          {featureService.hasConciliation() && !prescription.concilia && (
            <FloatButton
              onClick={() => addConciliation()}
              icon={<ReconciliationOutlined />}
              tooltip={{ title: "Abrir conciliação", placement: "left" }}
            />
          )}
        </ScreeningFloatButtonGroup>
      )}

      <FormPatientModal
        open={patientEditVisible}
        onCancel={() => setModalVisibility("patientEdit", false)}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
        afterSavePatient={afterSavePatient}
      />
      <InterventionOutcome />

      <CheckSummary
        hasCpoe={prescription?.isCpoe}
        checkScreening={checkScreening}
        headers={prescription?.headers}
        alerts={prescription?.alertsList}
        interventions={interventions}
      />
      <SingleClinicalNotesModal />
      <ChooseConciliation />
      <ExamsModal idSegment={prescription.idSegment} />
      <ClinicalNotesModal />

      <DefaultModal
        width="90%"
        centered
        destroyOnHidden
        footer={null}
        open={!!checkedIndexReport}
        onCancel={() => dispatch(setCheckedIndexReport(null))}
      >
        <CheckedIndexReport
          idPrescriptionDrug={checkedIndexReport?.idPrescriptionDrug}
          data={checkedIndexReport?.data}
        />
      </DefaultModal>
    </>
  );
}
