import React from "react";
import { Formik } from "formik";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CheckOutlined } from "@ant-design/icons";

import { Row, Col } from "components/Grid";
import Button from "components/Button";
import notification from "components/notification";

import Base from "./Base";
import { Footer, FormContainer } from "./Drug.style";

const saveMessage = {
  message: "Uhu! Medicamento salvo com sucesso! :)",
};

const formId = "drugForm";

export default function Drug({
  saveStatus,
  saveDrug,
  afterSaveDrug,
  outlier,
  units,
  idSegment,
  security,
  fetchReferencesList,
}) {
  const matchParams = useParams();
  const { t } = useTranslation();
  const { isSaving } = saveStatus;
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
    defaultNote,
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
    unit: outliers ? (outliers[0] ? outliers[0].unit : "") : "",
    defaultNote,
  };

  const submit = (params) => {
    saveDrug(params)
      .then(() => {
        notification.success(saveMessage);
        afterSaveDrug();
        if (!isEmpty(matchParams)) {
          fetchReferencesList(
            matchParams.idSegment,
            matchParams.idDrug,
            matchParams.dose,
            matchParams.frequency
          );
        } else {
          fetchReferencesList();
        }
      })
      .catch((err) => {
        console.err(err);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  return (
    <Formik enableReinitialize onSubmit={submit} initialValues={initialValues}>
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
                  loading={isSaving}
                  icon={<CheckOutlined />}
                >
                  Salvar
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
    idMeasureUnit: "",
    antimicro: "",
    mav: "",
    controlled: "",
    notdefault: "",
    unit: "",
  },
};
