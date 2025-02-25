import React from "react";
import { useDispatch } from "react-redux";
import {
  MenuOutlined,
  UserOutlined,
  CloseOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import { FloatButton } from "antd";

import FormPatientModal from "containers/Forms/Patient";
import { shouldUpdatePrescription } from "features/serverActions/ServerActionsSlice";
import InterventionOutcome from "features/intervention/InterventionOutcome/InterventionOutcome";
import CheckSummary from "features/prescription/CheckSummary/CheckSummary";
import SingleClinicalNotesModal from "features/prescription/ClinicalNotes/SingleClinicalNotesModal/SingleClinicalNotesModal";
import SecurityService from "services/security";
import FeaturesService from "services/features";
import { setChooseConciliationModal } from "features/prescription/PrescriptionSlice";
import ChooseConciliation from "features/prescription/ChooseConciliation/ChooseConciliation";
import ExamsModal from "features/exams/ExamModal/ExamModal";

import { ScreeningFloatButtonGroup } from "../index.style";

export default function ScreeningActions({
  fetchScreening,
  prescription,
  setModalVisibility,
  patientEditVisible,
  roles,
  features,
  checkScreening,
  interventions,
}) {
  const dispatch = useDispatch();
  const security = SecurityService(roles);
  const featureService = FeaturesService(features);

  const afterSavePatient = (response) => {
    if (response.updatePrescription) {
      dispatch(
        shouldUpdatePrescription({
          idPrescription: prescription.idPrescription,
        })
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
      <ScreeningFloatButtonGroup
        trigger="click"
        type="primary"
        icon={<MenuOutlined />}
        tooltip="Menu"
        style={{ bottom: 25 }}
      >
        <FloatButton
          icon={<CloseOutlined />}
          onClick={() => window.close()}
          tooltip="Fechar prescrição"
        />
        <FloatButton
          onClick={() => setModalVisibility("patientEdit", true)}
          icon={<UserOutlined />}
          tooltip="Editar dados do paciente"
        />
        {featureService.hasConciliation() && !prescription.concilia && (
          <FloatButton
            onClick={() => addConciliation()}
            icon={<ReconciliationOutlined />}
            tooltip="Abrir conciliação"
          />
        )}
      </ScreeningFloatButtonGroup>

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
        hasCpoe={security.hasCpoe()}
        checkScreening={checkScreening}
        headers={prescription?.headers}
        alerts={prescription?.alertsList}
        interventions={interventions}
      />
      <SingleClinicalNotesModal />
      <ChooseConciliation />
      <ExamsModal idSegment={prescription.idSegment} />
    </>
  );
}
