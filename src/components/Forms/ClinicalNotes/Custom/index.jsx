import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CustomForm from '@components/Forms/CustomForm';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';
import { SIGNATURE_STORE_ID, SIGNATURE_MEMORY_TYPE } from '@utils/memory';

export default function ClinicalNotes({
  prescription,
  save,
  afterSave,
  account,
  signature,
  action,
  fetchMemory,
  visible,
  type,
  onCancel,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving, success, error, data } = prescription;
  const initialValues = {
    idPrescription: data.idPrescription,
    admissionNumber: data.admissionNumber,
    notes: data.notes ? data.notes : '',
    concilia: data.concilia && data.concilia === 's' ? '' : data.concilia,
    hasConciliation: !!data.concilia,
    action,
    date: null,
    visible: type === 'primarycare' ? visible : false //reinitialize formik if primarycare
  };

  useEffect(() => {
    if (visible) {
      fetchMemory(SIGNATURE_STORE_ID, `${SIGNATURE_MEMORY_TYPE}_${account.userId}`);
    }
  }, [account.userId, fetchMemory, visible]);

  useEffect(() => {
    if (success === true) {
      const saveMessage = {
        message:
          action === 'schedule'
            ? 'Uhu! Agendamento efetuado com sucesso! :)'
            : 'Uhu! Evolução salva com sucesso! :)'
      };
      notification.success(saveMessage);
      if (afterSave) {
        afterSave();
      }
    }

    if (error) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [success, error]); // eslint-disable-line

  const submit = formData => {
    console.log('modal submit', formData);
  };

  return (
    <DefaultModal
      width={700}
      centered
      destroyOnClose
      visible={visible}
      {...props}
      confirmLoading={isSaving}
      footer={null}
    >
      <header>
        <Heading margin="0 0 11px">Evolução</Heading>
      </header>
      <CustomForm onSubmit={submit} onCancel={onCancel} />
    </DefaultModal>
  );
}
