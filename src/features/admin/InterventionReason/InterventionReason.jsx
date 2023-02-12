import React, { useEffect, useState } from "react";
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
import InterventionReasonForm from "./Form/InterventionReasonForm";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

function InterventionReason() {
  const { t } = useTranslation();
  const [formVisible, setFormVisible] = useState(false);
  const dispatch = useDispatch();
  const list = useSelector(selectAllInterventionReasons);
  const status = useSelector((state) => state.admin.interventionReason.status);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInterventionReasons());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return <LoadBox />;
  }

  if (status === "failed") {
    notification.error({
      message: t("userAdminForm.errorMessage"),
      description: t("userAdminForm.errorDescription"),
    });
  }

  if (status === "succeeded") {
    const ds = toDataSource(list, null, {});

    return (
      <>
        <Table
          columns={columns(t, dispatch, setFormVisible, setInterventionReason)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={ds || []}
        />
        <InterventionReasonForm visible={formVisible} />
        <BackTop />
      </>
    );
  }
}

export default InterventionReason;
