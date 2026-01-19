import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "src/components/Button";
import notification from "components/notification";
import { Select } from "components/Inputs";
import IntegrationStatusTag from "components/IntegrationStatusTag";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";
import { intersection } from "utils/lodash";
import { CreateSchemaForm } from "./CreateSchemaForm/CreateSchemaForm";
import { CloudSchemaForm } from "./CloudSchemaForm/CloudSchemaForm";

import columns from "./columns";
import {
  fetchIntegrations,
  reset,
  setIntegration,
  setCloudConfigSchema,
} from "./IntegrationConfigSlice";
import IntegrationConfigForm from "./Form/IntegrationConfigForm";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";
import { ExtraFilters } from "styles/PageHeader.style";

const filterList = (ds, filter) => {
  if (!ds) return [];

  return ds.filter((i) => {
    let show = true;

    if (filter.status !== null && filter.status !== undefined) {
      show = show && i.status === filter.status;
    }

    if (filter.nhCare !== null && filter.nhCare !== undefined) {
      show = show && i.nhCare === filter.nhCare;
    }

    if (filter.cpoe !== null && filter.cpoe !== undefined) {
      show = show && i.cpoe === filter.cpoe;
    }

    if (
      filter.returnIntegration !== null &&
      filter.returnIntegration !== undefined
    ) {
      show = show && i.returnIntegration === filter.returnIntegration;
    }

    if (filter.fl.length) {
      const activeFlows = Object.keys(i).map((k) => {
        if (i[k] === true) {
          return k;
        }

        return null;
      });

      show = show && intersection(filter.fl, activeFlows).length > 0;
    }

    return show;
  });
};

function IntegrationConfig() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.integrationConfig.list);
  const status = useSelector((state) => state.admin.integrationConfig.status);
  const [createModal, setCreateModal] = useState(false);
  const [filter, setFilter] = useState({
    status: null,
    fl: [],
  });

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

  const ds = toDataSource(filterList(list, filter), null, {});

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Configuração de Integrações</h1>
          <div className="page-header-legend">
            Lista de integrações e seus atributos.
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModal(true)}
          >
            Novo schema
          </Button>
        </div>
      </PageHeader>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <ExtraFilters>
          <div className="filter-field">
            <label>Situação</label>
            <Select
              onChange={(val) => setFilter({ ...filter, status: val })}
              placeholder="Filtrar por situação"
              allowClear
              style={{ minWidth: "200px" }}
              optionFilterProp="children"
              loading={status === "loading"}
            >
              <Select.Option value={0}>
                <IntegrationStatusTag status={0} />
              </Select.Option>
              <Select.Option value={1}>
                <IntegrationStatusTag status={1} />
              </Select.Option>
              <Select.Option value={2}>
                <IntegrationStatusTag status={2} />
              </Select.Option>
            </Select>
          </div>

          <div className="filter-field">
            <label>Integração de retorno</label>
            <Select
              onChange={(val) =>
                setFilter({ ...filter, returnIntegration: val })
              }
              allowClear
              style={{ minWidth: "200px" }}
              optionFilterProp="children"
              loading={status === "loading"}
            >
              <Select.Option value={true}>Sim</Select.Option>
              <Select.Option value={false}>Não</Select.Option>
            </Select>
          </div>
        </ExtraFilters>
        <div style={{ paddingRight: "5px" }}>
          {status !== "loading" && `${ds.length} registros`}
        </div>
      </div>
      <PageCard>
        <Table
          columns={columns(t, dispatch, setIntegration, setCloudConfigSchema)}
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

      <IntegrationConfigForm />
      <CreateSchemaForm open={createModal} setOpen={setCreateModal} />
      <CloudSchemaForm />
      <BackTop />
    </>
  );
}

export default IntegrationConfig;
