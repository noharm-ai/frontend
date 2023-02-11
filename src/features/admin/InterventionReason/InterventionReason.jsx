import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import notification from "components/notification";
import columns from "./columns";
import { useTranslation } from "react-i18next";
import LoadBox from "components/LoadBox";
import { toDataSource } from "utils";
import {
  fetchInterventionReasons,
  selectAllInterventionReasons,
  selectInterventionReason,
  setInterventionReason,
} from "./InterventionReasonSlice";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

function InterventionReason() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector(selectAllInterventionReasons);
  const status = useSelector((state) => state.admin.interventionReason.status);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInterventionReasons());
    }

    if (status === "failed") {
      notification.error({
        message: t("userAdminForm.errorMessage"),
        description: t("userAdminForm.errorDescription"),
      });
    }
  }, [status, dispatch, t]);

  if (status === "loading") {
    return <LoadBox />;
  }

  if (status === "succeeded") {
    const ds = toDataSource(list, null, {
      setInterventionReason,
    });

    return (
      <>
        <Table
          columns={columns(t, dispatch)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={ds || []}
        />
        <BackTop />
      </>
    );
  }

  // useEffect(() => {
  //   fetchList();
  // }, [fetchList]);

  // useEffect(() => {
  //   if (error) {
  //     notification.error({
  //       message: t("userAdminForm.errorMessage"),
  //       description: t("userAdminForm.errorDescription"),
  //     });
  //   }
  // }, [error, t]);

  // const ds = toDataSource(list, null, {});

  // if (isFetching) {
  //   return <LoadBox />;
  // }

  return (
    <>
      <strong>Lista de intervenções</strong>
      {/* <Table
        columns={columns(false, t)}
        pagination={false}
        loading={isFetching}
        locale={{ emptyText }}
        dataSource={!isFetching ? ds : []}
      /> */}
      <BackTop />
    </>
  );
}

export default InterventionReason;
