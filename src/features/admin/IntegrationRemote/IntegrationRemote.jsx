import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

import Graph from "./components/Graph";
import { flatStatuses } from "./transformer";
import { fetchTemplate, reset } from "./IntegrationRemoteSlice";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

export default function IntegrationRemote() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const [template, setTemplate] = useState(null);
  const [templateStatus, setTemplateStatus] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplate()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setTemplate(response.payload.data.data.template);
        const flatStatus = {};
        flatStatuses(response.payload.data.data.template.status, flatStatus);
        setTemplateStatus(flatStatus);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Integração: Acesso Remoto</h1>
          <div className="page-header-legend">
            Acesso remoto à ferramenta de integração
          </div>
        </div>
      </PageHeader>

      <Spin spinning={status === "loading"}>
        <PageCard style={{ minHeight: "60vh" }}>
          {template && templateStatus && (
            <Graph template={template} templateStatus={templateStatus} />
          )}
        </PageCard>
      </Spin>
    </>
  );
}
