import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import notification from "components/notification";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";

import columns from "./columns";

import {
  fetchIntegrations,
  reset,
  setIntegration,
} from "./IntegrationConfigSlice";
import IntegrationConfigForm from "./Form/IntegrationConfigForm";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard, PageContainer } from "styles/Utils.style";

function IntegrationConfig() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.integrationConfig.list);
  const status = useSelector((state) => state.admin.integrationConfig.status);

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("errors.empty")}
    />
  );

  useEffect(() => {
    dispatch(fetchIntegrations()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });

    return () => {
      dispatch(reset());
    };
  }, [dispatch, t]);

  const ds = toDataSource(list, null, {});

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">Configuração de Integrações</h1>
        <div className="page-header-actions"></div>
      </PageHeader>
      <PageContainer>
        <PageCard>
          <Table
            columns={columns(t, dispatch, setIntegration)}
            pagination={false}
            loading={status === "loading"}
            locale={{ emptyText }}
            dataSource={ds || []}
            rowClassName={(record) =>
              `${
                record.schema === localStorage.getItem("schema")
                  ? "highlight"
                  : ""
              }`
            }
          />
        </PageCard>
      </PageContainer>
      <IntegrationConfigForm />
      <BackTop />
    </>
  );
}

export default IntegrationConfig;
