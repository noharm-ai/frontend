import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RobotOutlined } from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import columns from "./columns";
import { useTranslation } from "react-i18next";
import { toDataSource } from "utils";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import Filter from "./Filter/Filter";
import {
  setFrequency,
  inferFrequencies,
  fetchFrequencies,
} from "./FrequencySlice";
import FrequencyForm from "./Form/FrequencyForm";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import DefaultModal from "components/Modal";

import { PageContainer } from "styles/Utils.style";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

function Frequency() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.frequency.list);
  const status = useSelector((state) => state.admin.frequency.status);
  const inferStatus = useSelector(
    (state) => state.admin.frequency.inferFrequencies.status
  );

  const ds = toDataSource(list, null, {});

  const executeInfer = () => {
    dispatch(inferFrequencies()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        const inferResult = response.payload.data;

        DefaultModal.info({
          title: "Resultado",
          content: (
            <>
              <ul>
                <li>Inferidos: {inferResult.inferred}</li>
                <li>Pendentes: {inferResult.skipped}</li>
              </ul>
            </>
          ),
          width: 500,
          okText: "Fechar",
          okButtonProps: { type: "default" },
          wrapClassName: "default-modal",
          mask: { blur: false },
        });

        dispatch(fetchFrequencies());
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.frequency")}</h1>
        </div>

        <div className="page-header-actions">
          <Tooltip title="Tentar preencher a frequência dia com base no histórico">
            <Button
              type="primary"
              onClick={() => executeInfer()}
              icon={<RobotOutlined />}
              loading={inferStatus === "loading"}
            >
              Inferir frequência dia
            </Button>
          </Tooltip>
        </div>
      </PageHeader>
      <Filter />
      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setFrequency, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <FrequencyForm />
      <BackTop />
    </PageContainer>
  );
}

export default Frequency;
