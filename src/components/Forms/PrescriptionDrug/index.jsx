import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Row } from '@components/Grid';
import Button from '@components/Button';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

import Base from './Base';

export default function PrescriptionDrug({
  item,
  success,
  error,
  isSaving,
  save,
  select,
  searchDrugs,
  fetchDrugSummary,
  drugs,
  drugSummary
}) {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    dose: Yup.number()
      .nullable()
      .required(t('validation.requiredField'))
  });

  useEffect(() => {
    if (success) {
      select({});

      notification.success({
        message: t('success.generic')
      });
    }
  }, [success, select, t]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [error, t]);

  if (isEmpty(item)) {
    return null;
  }

  const onCancel = () => {
    select({});
  };

  const onSave = params => {
    console.log('save!', item, params);
    save(item.idPrescriptionDrug, item.source, params);
  };

  const Footer = ({ handleSubmit }) => {
    return (
      <>
        <Button onClick={() => onCancel()} disabled={isSaving} className="gtm-bt-cancel-drugEdit">
          {t('interventionForm.btnCancel')}
        </Button>

        <Button
          type="primary gtm-bt-save-drugEdit"
          onClick={() => handleSubmit()}
          loading={isSaving}
        >
          {t('interventionForm.btnSave')}
        </Button>
      </>
    );
  };

  const initialValues = {
    idPrescription: item.idPrescription,
    idPrescriptionDrug: item.idPrescriptionDrug,
    idDrug: item.idDrug,
    drug: item.drug,
    idSegment: item.idSegment,
    dose: item.dose,
    measureUnit: item.measureUnit ? item.measureUnit.value : null,
    measureUnitLabel: item.measureUnit ? item.measureUnit.label : null,
    frequency: item.frequency ? item.frequency.value : null,
    frequencyLabel: item.frequency ? item.frequency.label : null,
    interval: item.interval,
    route: item.route
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          visible={!isEmpty(item)}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          footer={<Footer handleSubmit={handleSubmit} />}
        >
          <header>
            <Heading margin="0 0 15px">{t('prescriptionDrugForm.title')}</Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <Row type="flex" gutter={[16, 16]}>
              <Base
                item={item}
                fetchDrugSummary={fetchDrugSummary}
                searchDrugs={searchDrugs}
                drugs={drugs}
                drugSummary={drugSummary}
              />
            </Row>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
