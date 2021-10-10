import React, { useEffect } from 'react';
import { Formik } from 'formik';
import isEmpty from 'lodash.isempty';
import { useTranslation } from 'react-i18next';

import { Row, Col } from '@components/Grid';
import Button from '@components/Button';
import notification from '@components/notification';
import Icon from '@components/Icon';

import Base from './Base';
import { Footer, FormContainer } from './Drug.style';

const saveMessage = {
  message: 'Uhu! Medicamento salvo com sucesso! :)'
};

const formId = 'drugForm';

export default function Drug({
  saveStatus,
  saveDrug,
  afterSaveDrug,
  outlier,
  units,
  idSegment,
  security,
  fetchReferencesList,
  match
}) {
  const { t } = useTranslation();
  const { isSaving, success, error } = saveStatus;
  const {
    idDrug,
    idMeasureUnit,
    antimicro,
    chemo,
    mav,
    controlled,
    notdefault,
    maxDose,
    price,
    maxTime,
    kidney,
    liver,
    platelets,
    elderly,
    tube,
    division,
    useWeight,
    outliers,
    amount,
    whiteList,
    amountUnit,
    defaultNote
  } = outlier;

  const initialValues = {
    formId,
    id: idDrug,
    antimicro: antimicro == null ? false : antimicro,
    chemo: chemo == null ? false : chemo,
    mav: mav == null ? false : mav,
    controlled: controlled == null ? false : controlled,
    notdefault: notdefault == null ? false : notdefault,
    elderly: elderly == null ? false : elderly,
    useWeight: useWeight == null ? false : useWeight,
    whiteList: whiteList == null ? false : whiteList,
    tube: tube == null ? false : tube,
    maxDose,
    price,
    maxTime,
    kidney,
    division,
    liver,
    platelets,
    idMeasureUnit,
    idSegment,
    amount,
    amountUnit,
    unit: outliers ? (outliers[0] ? outliers[0].unit : '') : '',
    defaultNote
  };

  useEffect(() => {
    if (success === formId) {
      notification.success(saveMessage);
      afterSaveDrug();
      if (!isEmpty(match.params)) {
        fetchReferencesList(
          match.params.idSegment,
          match.params.idDrug,
          match.params.dose,
          match.params.frequency
        );
      } else {
        fetchReferencesList();
      }
    }

    if (error) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [success, error, afterSaveDrug, fetchReferencesList, match.params, t]);

  return (
    <Formik enableReinitialize onSubmit={saveDrug} initialValues={initialValues}>
      {({ handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <Row type="flex" gutter={[16, 24]}>
              <Base units={units.list} security={security} />
            </Row>
          </FormContainer>
          <Row type="flex" gutter={[16, 24]}>
            <Col xs={12}>
              <Footer>
                <Button
                  type="primary gtm-bt-save-drug"
                  htmlType="submit"
                  disabled={isSaving || !isValid}
                >
                  Salvar <Icon type="check" />
                </Button>
              </Footer>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
}

Drug.defaultProps = {
  afterSaveDrug: () => {},
  initialValues: {
    idMeasureUnit: '',
    antimicro: '',
    mav: '',
    controlled: '',
    notdefault: '',
    unit: ''
  }
};
