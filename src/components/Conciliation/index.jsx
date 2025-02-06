import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Skeleton } from "antd";

import Empty from "components/Empty";
import LoadBox, { LoadContainer } from "components/LoadBox";
import notification from "components/notification";
import BackTop from "components/BackTop";

import PageHeader from "containers/Conciliation/PageHeader";
import Patient from "containers/Screening/Patient";
import ConciliationDrugList from "containers/Conciliation/ConciliationDrugList";
import PrescriptionDrugForm from "containers/Forms/PrescriptionDrug";
import ScreeningActions from "containers/Screening/ScreeningActions";
import FormIntervention from "containers/Forms/Intervention";

export default function Screening({ fetchScreeningById, isFetching, error }) {
  const params = useParams();
  const id = params?.slug;
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
      <PageHeader />

      <Skeleton title paragraph={false} loading={isFetching} active />

      {isFetching ? (
        <LoadContainer>
          <LoadBox absolute={true} />
        </LoadContainer>
      ) : (
        <Patient />
      )}

      <div style={{ marginTop: "15px" }}>
        <ConciliationDrugList />
      </div>

      {!isFetching && (
        <>
          <ScreeningActions />
          <FormIntervention />
        </>
      )}
      <PrescriptionDrugForm />
      <BackTop style={{ right: 80, bottom: 25 }} />
    </>
  );
}
