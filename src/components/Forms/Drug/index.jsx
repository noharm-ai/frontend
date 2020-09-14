import React, { useEffect } from 'react';
import { Formik } from 'formik';
import isEmpty from 'lodash.isempty';

import { Row } from '@components/Grid';
import Button from '@components/Button';
import notification from '@components/notification';
import Icon from '@components/Icon';

import Base from './Base';
import { Footer, FormContainer } from './Drug.style';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar os dados deste medicamento. Por favor, tente novamente.'
};

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
  const { isSaving, success, error } = saveStatus;
  const {
    idDrug,
    idMeasureUnit,
    antimicro,
    mav,
    controlled,
    notdefault,
    maxDose,
    price,
    kidney,
    liver,
    elderly,
    division,
    useWeight,
    outliers,
    amount,
    whiteList,
    amountUnit
  } = outlier;

  const initialValues = {
    formId,
    id: idDrug,
    antimicro: antimicro == null ? false : antimicro,
    mav: mav == null ? false : mav,
    controlled: controlled == null ? false : controlled,
    notdefault: notdefault == null ? false : notdefault,
    elderly: elderly == null ? false : elderly,
    useWeight: useWeight == null ? false : useWeight,
    whiteList: whiteList == null ? false : whiteList,
    maxDose,
    price,
    kidney,
    division,
    liver,
    idMeasureUnit,
    idSegment,
    amount,
    amountUnit,
    unit: outliers ? (outliers[0] ? outliers[0].unit : '') : ''
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
      notification.error(errorMessage);
    }
  }, [success, error, afterSaveDrug, fetchReferencesList, match.params]);

  return (
    <Formik
      enableReinitialize
      onSubmit={saveDrug}
      initialValues={initialValues}
    >
      {({ handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <Row type="flex" gutter={[16, 24]}>
              <Base units={units.list} security={security} />
            </Row>
          </FormContainer>
          <Footer>
            <Button
              type="primary gtm-bt-save-drug"
              htmlType="submit"
              disabled={isSaving || !isValid}
            >
              Salvar <Icon type="check" />
            </Button>
          </Footer>
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
