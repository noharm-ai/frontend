import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Skeleton } from "antd";

import Empty from "components/Empty";
import notification from "components/notification";
import { fetchRegulation, reset } from "./RegulationSlice";

import { PageHeader } from "styles/PageHeader.style";

export default function Regulation() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector((state) => state.regulation.regulation.status);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    dispatch(fetchRegulation({ id })).then((response) => {
      if (response.error) {
        notification.error({ message: "Solicitação não encontrada" });
      }
    });

    return () => {
      dispatch(reset());
    };
  }, [id, dispatch]);

  if (status === "loading") {
    return (
      <>
        <Skeleton
          title
          paragraph={false}
          loading={status === "loading"}
          active
        />
      </>
    );
  }

  if (status === "failed") {
    return <Empty description="Solicitação não encontrada" />;
  }

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Regulação nº: {id}</h1>
        </div>
        <div className="page-header-actions"></div>
      </PageHeader>
    </>
  );
}
