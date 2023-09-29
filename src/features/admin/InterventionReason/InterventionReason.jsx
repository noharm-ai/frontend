import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import notification from "components/notification";
import Button from "components/Button";
import { toDataSource } from "utils";

import columns from "./columns";

import {
  fetchInterventionReasons,
  selectAllInterventionReasons,
  setInterventionReason,
  reset,
} from "./InterventionReasonSlice";
import InterventionReasonForm from "./Form/InterventionReasonForm";

import { PageHeader } from "styles/PageHeader.style";

function InterventionReason() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector(selectAllInterventionReasons);
  const status = useSelector((state) => state.admin.interventionReason.status);

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("errors.empty")}
    />
  );

  useEffect(() => {
    dispatch(fetchInterventionReasons());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (status === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  const ds = toDataSource(list, null, {});

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">{t("menu.interventionReasons")}</h1>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            ghost
            onClick={() =>
              dispatch(setInterventionReason({ name: "", active: true }))
            }
          >
            {t("labels.add")}
          </Button>
        </div>
      </PageHeader>
      <Table
        columns={columns(t, dispatch, setInterventionReason)}
        pagination={false}
        loading={status === "loading"}
        locale={{ emptyText }}
        dataSource={ds || []}
      />
      <InterventionReasonForm />
      <BackTop />
    </>
  );
}

export default InterventionReason;
