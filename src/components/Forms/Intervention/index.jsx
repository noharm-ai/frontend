import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

import Base from './Base';
import { FormContainer } from '../Form.style';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar os dados desta intervenção. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Intervenção salva com sucesso! :)'
};
const requiredFieldMessage = 'Campo obrigatório';
const validationSchema = Yup.object().shape({
  alert: Yup.string()
    .nullable()
    .required(requiredFieldMessage),
  alertExpire: Yup.string()
    .nullable()
    .required(requiredFieldMessage)
});

export default function Intervention({
  intervention,
  reasons,
  updateInterventionData,
  reset,
  error,
  save,
  select,
  savePrescriptionDrugStatus,
  checkPrescriptionDrug,
  setVisibility,
  afterSaveIntervention,
  disableUndoIntervention,
  visible,
  fetchReasonsList,
  searchDrugs,
  drugs,
  ...props
}) {
  const { isSaving, wasSaved, item } = intervention;

  // handle after save intervention.
  useEffect(() => {
    if (wasSaved && visible) {
      if (afterSaveIntervention) {
        afterSaveIntervention(item);
      } else {
        updateInterventionData(item.idPrescriptionDrug, item.source, {
          ...item.intervention,
          status: 's'
        });
      }

      reset();
      setVisibility(false);

      notification.success(saveMessage);
    }
  }, [wasSaved, reset, item, updateInterventionData, setVisibility, visible]); // eslint-disable-line

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    if (visible) {
      fetchReasonsList();
    }
  }, [fetchReasonsList, visible]);

  if (!item.intervention) {
    return null;
  }

  const initialValues = {
    error: item.intervention.error,
    cost: item.intervention.cost,
    idInterventionReason: item.intervention.idInterventionReason,
    reasonDescription: null
  };

  console.log('intervention', intervention);
  console.log('initial values', initialValues);

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

  const InterventionFooter = ({ handleSubmit }) => {
    const isChecked = item.intervention && item.intervention.status === 's';

    const undoIntervention = () => {
      savePrescriptionDrugStatus(item.idPrescriptionDrug, item.idPrescription, '0', item.source);
      setVisibility(false);
    };

    return (
      <>
        <Button onClick={() => onCancel()} disabled={isSaving} className="gtm-bt-cancel-interv">
          Cancelar
        </Button>
        {isChecked && !disableUndoIntervention && (
          <Tooltip title="Desfazer intervenção" placement="top">
            <Button
              type="danger gtm-bt-undo-interv"
              ghost
              loading={checkPrescriptionDrug && checkPrescriptionDrug.isChecking}
              onClick={() => undoIntervention()}
            >
              <Icon type="rollback" style={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        )}

        <Button
          type="primary gtm-bt-save-interv"
          onClick={() => handleSubmit()}
          disabled={isSaving || isSaveBtnDisabled(item)}
          loading={isSaving}
        >
          Salvar
        </Button>
      </>
    );
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={save}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          visible={visible}
          width={700}
          centered
          destroyOnClose
          footer={<InterventionFooter handleSubmit={handleSubmit} />}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px">Intervenção</Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base
                  intervention={intervention}
                  reasons={reasons}
                  searchDrugs={searchDrugs}
                  drugs={drugs}
                />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
