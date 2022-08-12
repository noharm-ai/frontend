import React, { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Row } from "components/Grid";
import Button from "components/Button";
import notification from "components/notification";

import Departments from "./Departments";
import { Footer } from "./Segment.style";

// save message when saved intervention.
const saveMessage = {
  message: "Uhu! Segmento salvo com sucesso! :)",
};
const validationSchema = Yup.object().shape({
  id: Yup.number(),
  description: Yup.string().required(),
  departments: Yup.array(),
});

export default function Segment({
  initialValues,
  departments,
  saveStatus,
  saveSegment,
  fetchDepartments,
  afterSaveSegment,
  segmentDepartments,
  firstFilter,
}) {
  const { t } = useTranslation();
  const { isSaving, success, error } = saveStatus;
  const departmentsList = [...departments.list, ...segmentDepartments];

  // fetch departments.
  useEffect(() => {
    if (firstFilter.idSegment) {
      fetchDepartments();
    }
  }, [fetchDepartments, firstFilter.idSegment]);

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      afterSaveSegment();
    }

    if (error) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [success, error, afterSaveSegment, fetchDepartments, t]);

  return (
    <Formik
      enableReinitialize
      onSubmit={saveSegment}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit}>
          <Row type="flex" gutter={24}>
            <Departments
              isFetching={departments.isFetching}
              list={departmentsList}
            />
          </Row>
          <Footer>
            <Button
              type="primary gtm-bt-save-segment"
              htmlType="submit"
              disabled={isSaving || !isValid}
            >
              Salvar
            </Button>
          </Footer>
        </form>
      )}
    </Formik>
  );
}

Segment.defaultProps = {
  afterSaveSegment: () => {},
  initialValues: {
    description: "",
    departments: [],
  },
};
