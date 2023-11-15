import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PlusOutlined, CopyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import notification from "components/notification";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";

import columns from "./columns";

import {
  fetchInterventionReasons,
  selectAllInterventionReasons,
  setInterventionReason,
  initInterventionReason,
  reset,
} from "./InterventionReasonSlice";
import InterventionReasonForm from "./Form/InterventionReasonForm";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

function InterventionReason() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector(selectAllInterventionReasons);
  const status = useSelector((state) => state.admin.interventionReason.status);
  const initInterventionReasonStatus = useSelector(
    (state) => state.admin.interventionReason.initInterventionReason.status
  );

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

  const executeInitInterventionReason = () => {
    dispatch(initInterventionReason()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const confirmInitInterventions = () => {
    DefaultModal.confirm({
      title: "Confirma a cópia inicial dos motivos de intervenção?",
      content: (
        <>
          <p>
            Esta ação copia os motivos de intervenção da curadoria NoHarm. Ideal
            para novas integrações.
          </p>
          <p>
            *Só é possível copiar se não houver nenhum motivo de intervenção
            cadastrado neste hospital.
          </p>
        </>
      ),
      onOk: executeInitInterventionReason,
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  const ds = toDataSource(list, null, {});

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">{t("menu.interventionReasons")}</h1>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              dispatch(setInterventionReason({ name: "", active: true }))
            }
          >
            {t("labels.add")}
          </Button>
          <Tooltip title="Clique para mais informações">
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => confirmInitInterventions()}
              loading={initInterventionReasonStatus === "loading"}
            >
              Copiar
            </Button>
          </Tooltip>
        </div>
      </PageHeader>
      <PageCard>
        <Table
          columns={columns(t, dispatch, setInterventionReason)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={ds || []}
        />
      </PageCard>
      <InterventionReasonForm />
      <BackTop />
    </>
  );
}

export default InterventionReason;
