import React, { useEffect } from 'react';

import DefaultModal from '@components/Modal';
import notification from '@components/notification';

import PrescriptionDrug from '@containers/Screening/PrescriptionDrug';

export default function Modal({
  visible,
  setVisibility,
  prescriptionDrug,
  savePrescriptionDrug,
  updatePrescriptionDrugData,
  selectPrescriptionDrug
}) {
  const onSavePrescriptionDrug = () =>
    savePrescriptionDrug(prescriptionDrug.item.idPrescriptionDrug, prescriptionDrug.item);
  const onCancelPrescriptionDrug = () => {
    selectPrescriptionDrug({});
    setVisibility(false);
  };

  useEffect(() => {
    if (prescriptionDrug.success) {
      updatePrescriptionDrugData(
        prescriptionDrug.item.idPrescriptionDrug,
        prescriptionDrug.item.source,
        prescriptionDrug.item
      );
      setVisibility(false);

      notification.success({ message: 'Uhu! Anotação salva com sucesso' });
    }
  }, [prescriptionDrug.item, prescriptionDrug.success, setVisibility, updatePrescriptionDrugData]);

  return (
    <DefaultModal
      centered
      destroyOnClose
      onOk={onSavePrescriptionDrug}
      visible={visible}
      onCancel={onCancelPrescriptionDrug}
      confirmLoading={prescriptionDrug.isSaving}
      okButtonProps={{
        disabled: prescriptionDrug.isSaving
      }}
      cancelButtonProps={{
        disabled: prescriptionDrug.isSaving,
        className: 'gtm-bt-cancel-notes'
      }}
      okText="Salvar"
      okType="primary gtm-bt-save-notes"
      cancelText="Cancelar"
    >
      <PrescriptionDrug />
    </DefaultModal>
  );
}
