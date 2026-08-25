import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Alert, Flex, Popconfirm, Space, Tag } from "antd";

import { Input, Textarea } from "components/Inputs";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import Table from "components/Table";
import notification from "components/notification";
import {
  getUserResetToken,
  getUserResetPasswordHistory,
  sendUserResetPasswordEmail,
} from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { formatDateTime } from "utils/date";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

const ORIGIN_LABELS = {
  email: "Email",
  link: "Link manual",
  self: "Esqueci a senha",
};

export function ResetPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { values } = useFormikContext();
  const [emailLoading, setEmailLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkConfirmOpen, setLinkConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState(null);

  const registeredEmail = (values.email || "").trim();
  const emailMatches =
    confirmEmail.trim().toLowerCase() === registeredEmail.toLowerCase();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({ message: "Link copiado!" });
  };

  const sendResetPasswordEmail = () => {
    setEmailLoading(true);

    dispatch(sendUserResetPasswordEmail({ idUser: values.id })).then(
      (response) => {
        setEmailLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else if (response.payload.data.delivered) {
          notification.success({
            message: `Email com o link de reset de senha enviado para ${response.payload.data.email}`,
          });
        } else {
          notification.warning({
            message: `O email para ${response.payload.data.email} não pôde ser entregue`,
            description:
              "Tente novamente mais tarde ou utilize o link manual como alternativa.",
          });
        }
      },
    );
  };

  const showResetLink = (token) => {
    const link = `${import.meta.env.VITE_APP_URL}/reset/${token}`;

    DefaultModal.info({
      title: "Link para Reset de Senha",
      content: (
        <>
          <p>
            Cuidado ao disponibilizar este link. Confira se o usuário é
            legítimo. Encaminhe este link somente para o email do usuário que
            irá utilizá-lo: <strong>{registeredEmail}</strong>.
          </p>
          <Textarea
            onClick={() => copyToClipboard(link)}
            style={{ minHeight: "300px" }}
            value={link}
          ></Textarea>
        </>
      ),
      icon: null,
      width: 500,
      okText: "Fechar",
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
      mask: { blur: false },
    });
  };

  const generateResetToken = () => {
    setLinkLoading(true);

    dispatch(getUserResetToken({ idUser: values.id })).then((response) => {
      setLinkLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        closeLinkConfirm();
        showResetLink(response.payload.data);
      }
    });
  };

  const closeLinkConfirm = () => {
    setLinkConfirmOpen(false);
    setConfirmEmail("");
  };

  const openHistory = () => {
    setHistoryLoading(true);

    dispatch(getUserResetPasswordHistory({ idUser: values.id })).then(
      (response) => {
        setHistoryLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          setHistory(response.payload.data);
        }
      },
    );
  };

  const historyColumns = [
    {
      title: "Data",
      dataIndex: "requestedAt",
      render: (value) => (value ? formatDateTime(value) : "-"),
    },
    {
      title: "Solicitado por",
      dataIndex: "requestedBy",
      render: (value) => value || "-",
    },
    {
      title: "Método",
      dataIndex: "origin",
      render: (value, record) => (
        <Space size={4}>
          {ORIGIN_LABELS[value] || "-"}
          {value === "email" && record.delivered === false && (
            <Tag color="red">Não entregue</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Situação",
      dataIndex: "used",
      render: (value, record) =>
        value ? (
          <Tag color="green">Utilizado em {formatDateTime(record.usedAt)}</Tag>
        ) : (
          <Tag>Não utilizado</Tag>
        ),
    },
  ];

  if (
    !values.id ||
    !PermissionService().hasAny([
      Permission.SEND_RESET_PASSWORD_EMAIL,
      Permission.ADMIN_USERS,
      Permission.READ_RESET_PASSWORD_HISTORY,
    ])
  ) {
    return null;
  }

  return (
    <div className={`form-row`}>
      <Flex gap={8} wrap>
        {PermissionService().has(Permission.SEND_RESET_PASSWORD_EMAIL) && (
          <Popconfirm
            title="Reset de senha"
            description={`Enviar o email com o link de reset de senha para ${registeredEmail}?`}
            onConfirm={() => sendResetPasswordEmail()}
            okText="Enviar"
            cancelText="Cancelar"
          >
            <Button type="primary" loading={emailLoading}>
              Enviar email de reset de senha
            </Button>
          </Popconfirm>
        )}

        {PermissionService().has(Permission.ADMIN_USERS) && (
          <Button danger onClick={() => setLinkConfirmOpen(true)}>
            Gerar link para reset de senha
          </Button>
        )}

        {PermissionService().has(Permission.READ_RESET_PASSWORD_HISTORY) && (
          <Button onClick={() => openHistory()} loading={historyLoading}>
            Histórico de reset de senha
          </Button>
        )}
      </Flex>

      <DefaultModal
        open={linkConfirmOpen}
        title="Gerar link para reset de senha"
        onCancel={() => closeLinkConfirm()}
        onOk={() => generateResetToken()}
        okText="Gerar link"
        cancelText="Cancelar"
        okButtonProps={{ disabled: !emailMatches, loading: linkLoading }}
        width={500}
      >
        <Alert
          type="warning"
          showIcon
          message="Este link dá acesso à conta do usuário"
          description={
            <>
              Utilize o link manual somente se o envio por email falhar. O link
              deve ser encaminhado <strong>exclusivamente</strong> para o email
              cadastrado do usuário: <strong>{registeredEmail}</strong>. Nunca
              envie para outro destinatário.
            </>
          }
        />
        <p style={{ marginTop: "16px" }}>
          Para confirmar, digite o email cadastrado do usuário:
        </p>
        <Input
          value={confirmEmail}
          onChange={({ target }) => setConfirmEmail(target.value)}
          placeholder={registeredEmail}
        />
      </DefaultModal>

      <DefaultModal
        open={history !== null}
        title="Histórico de reset de senha"
        onCancel={() => setHistory(null)}
        onOk={() => setHistory(null)}
        okText="Fechar"
        okButtonProps={{ type: "default" }}
        cancelButtonProps={{ style: { display: "none" } }}
        width={700}
      >
        <Table
          columns={historyColumns}
          dataSource={(history || []).map((item, index) => ({
            ...item,
            key: index,
          }))}
          pagination={false}
          size="small"
          locale={{ emptyText: "Nenhuma solicitação de reset de senha" }}
        />
      </DefaultModal>
    </div>
  );
}
