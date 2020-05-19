import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

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
const validationSchema = Yup.object().shape({
  id: Yup.number()
});

export default function Drug({ saveStatus, saveDrug, afterSaveDrug, outlier, units }) {
  const { isSaving, success, error } = saveStatus;
  const {
    idDrug,
    idMeasureUnit,
    antimicro,
    mav,
    controlled,
    notdefault,
    maxDose,
    kidney,
    liver,
    elderly,
    outliers
  } = outlier;

  const initialValues = {
    id: idDrug,
    antimicro: antimicro == null ? false : antimicro,
    mav: mav == null ? false : mav,
    controlled: controlled == null ? false : controlled,
    notdefault: notdefault == null ? false : notdefault,
    liver: liver == null ? false : liver,
    elderly: elderly == null ? false : elderly,
    maxDose,
    kidney,
    idMeasureUnit,
    unit: outliers[0] ? outliers[0].unit : ''
  };

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      afterSaveDrug();
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, afterSaveDrug]);

  return (
    <Formik
      enableReinitialize
      onSubmit={saveDrug}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <Row type="flex" gutter={[16, 24]}>
              <Base units={units.list} />
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
