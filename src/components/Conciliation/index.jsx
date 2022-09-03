import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Empty from "components/Empty";
import LoadBox from "components/LoadBox";
import { Row, Col } from "components/Grid";
import notification from "components/notification";
import BackTop from "components/BackTop";

import PageHeader from "containers/Conciliation/PageHeader";
import Patient from "containers/Screening/Patient";
import ConciliationDrugList from "containers/Conciliation/ConciliationDrugList";
import PrescriptionDrugForm from "containers/Forms/PrescriptionDrug";

import { BoxWrapper } from "./index.style";

export default function Screening({ fetchScreeningById, isFetching, error }) {
  const { id } = useParams();
  const { t } = useTranslation();

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={error.message}
        id="gtm-conciliation-error"
      />
    );
  }

  return (
    <>
      <BoxWrapper>
        <PageHeader />
        <Row type="flex" gutter={24}>
          <Col span={24} md={24}>
            {isFetching ? <LoadBox /> : <Patient />}
          </Col>
        </Row>
      </BoxWrapper>

      <div style={{ marginTop: "15px" }}>
        <ConciliationDrugList />
      </div>

      <PrescriptionDrugForm />
      <BackTop />
    </>
  );
}
