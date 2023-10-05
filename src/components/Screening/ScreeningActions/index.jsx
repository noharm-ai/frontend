import React from "react";
import { MenuOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

import FormPatientModal from "containers/Forms/Patient";

import { ScreeningFloatButtonGroup } from "../index.style";

export default function ScreeningActions({
  fetchScreening,
  prescription,
  setModalVisibility,
  patientEditVisible,
}) {
  const afterSavePatient = () => {
    fetchScreening(prescription.idPrescription);
    setModalVisibility("patientEdit", false);
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
    </>
  );
}
