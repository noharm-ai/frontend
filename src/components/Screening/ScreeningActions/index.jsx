import React from "react";
import { useDispatch } from "react-redux";
import { MenuOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

import FormPatientModal from "containers/Forms/Patient";
import { shouldUpdatePrescription } from "features/serverActions/ServerActionsSlice";
import InterventionOutcome from "features/intervention/InterventionOutcome/InterventionOutcome";
import CheckSummary from "features/prescription/CheckSummary/CheckSummary";
import SecurityService from "services/security";

import { ScreeningFloatButtonGroup } from "../index.style";

export default function ScreeningActions({
  fetchScreening,
  prescription,
  setModalVisibility,
  patientEditVisible,
  roles,
  checkScreening,
  interventions,
}) {
  const dispatch = useDispatch();
  const security = SecurityService(roles);

  const afterSavePatient = () => {
    dispatch(
      shouldUpdatePrescription({ idPrescription: prescription.idPrescription })
    ).then(() => {
      fetchScreening(prescription.idPrescription);
      setModalVisibility("patientEdit", false);
    });
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
      </ScreeningFloatButtonGroup>

      <FormPatientModal
        open={patientEditVisible}
        onCancel={() => setModalVisibility("patientEdit", false)}
        okText="Salvar"
        okType="primary gtm-bt-save-patient"
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
    </>
  );
}
