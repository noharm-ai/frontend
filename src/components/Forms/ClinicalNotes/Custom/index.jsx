import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CustomForm from '@components/Forms/CustomForm';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

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

  const submit = form => {
    const params = {
      idPrescription: data.idPrescription,
      admissionNumber: data.admissionNumber,
      formValues: form.values,
      template: form.template
    };

    console.log('modal submit', params);
    save(params);
  };

  return (
    <DefaultModal width={700} centered destroyOnClose visible={visible} {...props} footer={null}>
      <header>
        <Heading margin="0 0 11px">Evolução</Heading>
      </header>
      <CustomForm onSubmit={submit} onCancel={onCancel} isSaving={isSaving} />
    </DefaultModal>
  );
}
