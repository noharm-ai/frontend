import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import notification from '@components/notification';

import DefaultModal from '@components/Modal';
import Intervention from '@containers/Screening/Intervention';

// save message when saved intervention.
const saveMessage = {
  message: 'Uhu! Intervenção salva com sucesso! :)'
};
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function Modal({
  maybeCreateOrUpdate,
  updateInterventionData,
  reset,
  error,
  save,
  select,
  savePrescriptionDrugStatus,
  checkPrescriptionDrug,
  setVisibility,
  visible
}) {
  const { isSaving, wasSaved, item } = maybeCreateOrUpdate;

  const onSave = () => save(item);
  const onCancel = () => {
    select({});
    setVisibility(false);
  };

  const isSaveBtnDisabled = item => {
    if (isEmpty(item)) {
      return true;
    }

    if (isEmpty(item.intervention.idInterventionReason)) {
      return true;
    }

    return false;
  };

  const InterventionFooter = () => {
    const isChecked = item.status === 's';

    const undoIntervention = () => {
      savePrescriptionDrugStatus(item.idPrescriptionDrug, '0', item.source);
      setVisibility(false);
    };

    return (
      <>
        <Button onClick={() => onCancel()} disabled={isSaving} className="gtm-bt-cancel-interv">
          Cancelar
        </Button>
        {isChecked && (
          <Tooltip title="Desfazer intervenção" placement="top">
            <Button
              type="danger gtm-bt-undo-interv"
              ghost
              loading={checkPrescriptionDrug.isChecking}
              onClick={() => undoIntervention()}
            >
              <Icon type="rollback" style={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        )}

        <Button
          type="primary gtm-bt-save-interv"
          onClick={() => onSave()}
          disabled={isSaving || isSaveBtnDisabled(item)}
          loading={isSaving}
        >
          Salvar
        </Button>
      </>
    );
  };

  // handle after save intervention.
  useEffect(() => {
    if (wasSaved) {
      updateInterventionData(item.idPrescriptionDrug, item.source, item.intervention);
      reset();
      setVisibility(false);

      notification.success(saveMessage);
    }
  }, [wasSaved, reset, item, updateInterventionData, setVisibility]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  return (
    <DefaultModal
      centered
      destroyOnClose
      visible={visible}
      confirmLoading={isSaving}
      footer={<InterventionFooter />}
      onCancel={onCancel}
    >
      <Intervention />
    </DefaultModal>
  );
}
