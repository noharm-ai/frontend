import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { intersection } from "utils/lodash";
import { PlusOutlined } from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import notification from "components/notification";
import Tag from "components/Tag";
import { Select } from "components/Inputs";
import Button from "components/Button";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";
import Role from "models/Role";
import columns from "./columns";
import { fetchUsers, reset, setUser } from "./UserAdminSlice";
import UserAdminForm from "./Form/UserAdminForm";
import securityService from "services/security";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";
import { ExtraFilters } from "styles/PageHeader.style";

const filterList = (ds, filter) => {
  if (!ds) return [];

  return ds.filter((i) => {
    let show = true;

    if (filter.status !== null && filter.status !== undefined) {
      show = show && i.active === filter.status;
    }

    if (filter.roles.length) {
      show = show && intersection(filter.roles, i.roles).length > 0;
    }

    return show;
  });
};

export default function UserAdmin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const list = useSelector((state) => state.userAdmin.list);
  const status = useSelector((state) => state.userAdmin.status);
  const roles = useSelector((state) => state.user.account.roles);
  const [filter, setFilter] = useState({
    status: null,
    roles: [],
  });
  const security = securityService(roles);

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("errors.empty")}
    />
  );

  useEffect(() => {
    dispatch(fetchUsers()).then((response) => {
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
          <h1 className="page-header-title">Cadastro de Usuários</h1>
          <div className="page-header-legend">
            Lista de usuários com acesso à NoHarm
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(setUser({}))}
          >
            Novo usuário
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
              <Select.Option value={true}>
                <Tag color="green">Ativo</Tag>
              </Select.Option>
              <Select.Option value={false}>
                <Tag>Inativo</Tag>
              </Select.Option>
            </Select>
          </div>
          {security.isMaintainer() && (
            <div className="filter-field">
              <label>Permissão</label>
              <Select
                onChange={(val) => setFilter({ ...filter, roles: val })}
                placeholder="Filtrar por permissão"
                allowClear
                style={{ minWidth: "200px" }}
                optionFilterProp="children"
                loading={status === "loading"}
                mode="multiple"
              >
                {Role.getRoles(t).map((r) => (
                  <Select.Option value={r.id} key={r.id}>
                    {r.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        </ExtraFilters>
        <div style={{ paddingRight: "5px" }}>
          {status !== "loading" && `${ds.length} registros`}
        </div>
      </div>
      <PageCard>
        <Table
          columns={columns(t, dispatch, setUser)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={ds || []}
        />
      </PageCard>
      <UserAdminForm />
      <BackTop />
    </>
  );
}
