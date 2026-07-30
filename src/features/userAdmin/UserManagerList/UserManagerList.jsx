import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { MessageOutlined } from "@ant-design/icons";

import Table from "components/Table";
import Alert from "components/Alert";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import notification from "components/notification";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { setSupportOpen } from "features/support/SupportSlice";
import { fetchUserManagers } from "../UserAdminSlice";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

const columns = [
  {
    title: "Nome",
    dataIndex: "name",
    align: "left",
    width: 350,
  },
  {
    title: "Email",
    dataIndex: "email",
    align: "left",
    render: (email) => <a href={`mailto:${email}`}>{email}</a>,
  },
];

export function UserManagerList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const list = useSelector((state) => state.userAdmin.managers.list);
  const status = useSelector((state) => state.userAdmin.managers.status);

  const supportAction = PermissionService().has(Permission.WRITE_SUPPORT) ? (
    <Button
      type="primary"
      icon={<MessageOutlined />}
      onClick={() => dispatch(setSupportOpen(true))}
    >
      Abrir um Novo Chamado
    </Button>
  ) : (
    <div>
      Suporte NoHarm:{" "}
      <a href={`mailto:${import.meta.env.VITE_APP_SUPPORT_EMAIL}`}>
        <strong>{import.meta.env.VITE_APP_SUPPORT_EMAIL}</strong>
      </a>
    </div>
  );

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <>
          <div>
            Nenhum gestor de usuários ativo foi encontrado. Entre em contato com
            o suporte NoHarm
          </div>
          <div style={{ marginTop: "15px" }}>{supportAction}</div>
        </>
      }
    />
  );

  useEffect(() => {
    dispatch(fetchUserManagers()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });
  }, []); //eslint-disable-line

  const ds = toDataSource(list, "id", {});

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Cadastro de Usuários</h1>
        </div>
      </PageHeader>

      <Alert
        type="info"
        showIcon
        message="Você não possui permissão para criar ou alterar usuários"
        description="Entre em contato com um dos gestores de usuários abaixo para criar novos usuários ou alterar configurações de acesso"
      />

      <PageCard>
        <Table
          columns={columns}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={ds || []}
        />
      </PageCard>
      <BackTop />
    </>
  );
}
