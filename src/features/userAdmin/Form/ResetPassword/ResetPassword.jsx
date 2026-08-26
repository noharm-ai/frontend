import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Alert, Flex, Tag } from "antd";
import { MailOutlined } from "@ant-design/icons";

import { Input, Textarea } from "components/Inputs";
import Button from "components/Button";
import Card from "components/Card";
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
import { canManageResetPassword } from "./canManageResetPassword";

// typing a fixed word is enough of a speed bump to make the action
// deliberate; the registered email is shown right above it instead of being
// retyped, so the admin still reads who the link belongs to
const CONFIRM_WORD = "confirmar";

const ORIGIN_LABELS = {
  email: "Email",
  link: "Link manual",
  self: "Esqueci a senha",
};

export function ResetPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { values } = useFormikContext();
  const accountEmail = useSelector((state) => state.user.account.email);
  const [flowOpen, setFlowOpen] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [resetLink, setResetLink] = useState(null);
  const [confirmWord, setConfirmWord] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resetHistory, setResetHistory] = useState(null);

  const canSendEmail = PermissionService().has(
    Permission.SEND_RESET_PASSWORD_EMAIL,
  );
  const canGenerateLink = PermissionService().hasAny([
    Permission.GENERATE_RESET_PASSWORD_LINK,
    Permission.ADMIN_USERS,
  ]);
  const canReadHistory = PermissionService().has(
    Permission.READ_RESET_PASSWORD_HISTORY,
  );

  const registeredEmail = (values.email || "").trim();
  const senderEmail = (accountEmail || "").trim();
  const confirmed =
    !!registeredEmail && confirmWord.trim().toLowerCase() === CONFIRM_WORD;

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);

    dispatch(getUserResetPasswordHistory({ idUser: values.id })).then(
      (response) => {
        setHistoryLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          setResetHistory(response.payload.data);
        }
      },
    );
  }, [dispatch, values.id, t]);

  useEffect(() => {
    if (values.id && canReadHistory) {
      loadHistory();
    }
  }, [values.id, canReadHistory, loadHistory]);

  const openFlow = () => {
    setEmailResult(null);
    setResetLink(null);
    setConfirmWord("");
    setFlowOpen(true);
  };

  const closeFlow = () => {
    setFlowOpen(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({ message: "Link copiado!" });
  };

  const openGmailCompose = (link) => {
    // same subject the backend uses in send_reset_password_email, so the user
    // sees one consistent email whichever path delivered the link
    const subject = "NoHarm: Redefinição de senha";
    const userName = (values.name || "").trim();
    const body = [
      userName ? `Olá, ${userName},` : "Olá,",
      "",
      "Para cadastrar uma nova senha no NoHarm, acesse o link abaixo:",
      "",
      link,
      "",
      "O link é válido por 6 horas e pode ser utilizado uma única vez.",
      "",
      "Se você não solicitou a redefinição de senha, ignore este email.",
    ].join("\n");

    // the recipient is prefilled with the registered address, which makes the
    // safe path the default one. authuser pins the compose window to the
    // logged-in account: without it Gmail uses the browser's default account,
    // so an admin with several accounts signed in could send the link from the
    // wrong mailbox
    const url =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      (senderEmail ? `&authuser=${encodeURIComponent(senderEmail)}` : "") +
      `&to=${encodeURIComponent(registeredEmail)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(url, "_blank", "noopener,noreferrer");
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

          return;
        }

        setEmailResult(response.payload.data);

        if (canReadHistory) {
          loadHistory();
        }
      },
    );
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
        setResetLink(
          `${import.meta.env.VITE_MAIL_TEMPLATE_HOST}/reset/${response.payload.data}`,
        );

        if (canReadHistory) {
          loadHistory();
        }
      }
    });
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
      render: (value) => ORIGIN_LABELS[value] || "-",
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

  // when the admin cannot generate the link there is no second option to point
  // at: send them to an administrator instead of to a card with no action.
  const fallbackHint = canGenerateLink
    ? "Se o email não chegar, utilize o link manual ao lado."
    : "Se o email não chegar, solicite a um administrador que gere o link manual.";

  const emailOption = (
    <Card
      size="small"
      style={{ height: "100%" }}
      title={
        <Flex gap={8} align="center">
          <span>Enviar email de reset</span>
          <Tag color="green">Recomendado</Tag>
        </Flex>
      }
    >
      <p style={{ marginTop: 0 }}>
        O link é enviado por email para <strong>{registeredEmail}</strong>.
      </p>
      <p>
        Este envio usa um canal diferente do <strong>Esqueci a senha</strong> da
        tela de login, então a chance de o email chegar à caixa de entrada do
        usuário é maior. Comece por aqui.
      </p>

      <Button
        type="primary"
        onClick={() => sendResetPasswordEmail()}
        loading={emailLoading}
      >
        Enviar email
      </Button>

      {emailResult && (
        <div style={{ marginTop: "16px" }}>
          {emailResult.delivered ? (
            <Alert
              type="success"
              showIcon
              title={`Email enviado para ${emailResult.email}`}
              description={`Peça para o usuário verificar a caixa de entrada e o spam. ${fallbackHint}`}
            />
          ) : (
            <Alert
              type="error"
              showIcon
              title={`O email para ${emailResult.email} não pôde ser entregue`}
              description={`A tentativa foi registrada no histórico. Tente novamente. ${fallbackHint}`}
            />
          )}
        </div>
      )}
    </Card>
  );

  const linkOption = (
    <Card
      size="small"
      style={{ height: "100%" }}
      title={
        <Flex gap={8} align="center">
          <span>Gerar link manual</span>
          <Tag>Alternativa</Tag>
        </Flex>
      }
    >
      <p style={{ marginTop: 0 }}>
        Use esta opção quando o email não chegar ao usuário. O link gerado aqui
        é o mesmo que seria enviado por email, e cabe a você encaminhá-lo ao
        usuário.
      </p>

      {!canGenerateLink ? (
        <Alert
          type="warning"
          showIcon
          title="Link manual indisponível"
          description="Você não tem permissão para gerar o link manual. Solicite a um administrador."
        />
      ) : resetLink ? (
        <>
          <p>
            Cuidado ao disponibilizar este link. Confira se o usuário é
            legítimo. Encaminhe este link somente para o email do usuário que
            irá utilizá-lo: <strong>{registeredEmail}</strong>.
          </p>
          <Textarea
            onClick={() => copyToClipboard(resetLink)}
            style={{ minHeight: "80px" }}
            value={resetLink}
            readOnly
          ></Textarea>
          <div className="form-info" style={{ marginTop: "8px" }}>
            Clique no link para copiá-lo.
          </div>

          <Flex gap={8} wrap style={{ marginTop: "12px" }}>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={() => openGmailCompose(resetLink)}
            >
              Enviar pelo Gmail
            </Button>
            <Button
              onClick={() => {
                // re-arms the confirmation gate instead of handing out a
                // second link on a confirmation made for the previous one
                setResetLink(null);
                setConfirmWord("");
              }}
            >
              Gerar novo link
            </Button>
          </Flex>

          <div className="form-info" style={{ marginTop: "8px" }}>
            O Gmail abre com a mensagem pronta e o destinatário já preenchido
            com o email cadastrado.{" "}
            {senderEmail ? (
              <>
                A mensagem é aberta na sua conta <strong>{senderEmail}</strong>;
                confira o remetente e o destinatário antes de enviar.
              </>
            ) : (
              "Confira o destinatário antes de enviar."
            )}
          </div>
        </>
      ) : (
        <>
          <Alert
            type="warning"
            showIcon
            title="Este link dá acesso à conta do usuário"
            description={
              <>
                O link deve ser encaminhado <strong>exclusivamente</strong> para
                o email cadastrado do usuário:{" "}
                <strong>{registeredEmail}</strong>. Nunca envie para outro
                destinatário.
              </>
            }
          />
          <p style={{ marginTop: "16px" }}>
            Para confirmar, digite <strong>{CONFIRM_WORD}</strong> no campo
            abaixo:
          </p>
          <Input
            value={confirmWord}
            onChange={({ target }) => setConfirmWord(target.value)}
            placeholder={CONFIRM_WORD}
          />
          <Button
            danger
            onClick={() => generateResetToken()}
            disabled={!confirmed}
            loading={linkLoading}
            style={{ marginTop: "16px" }}
          >
            Gerar link
          </Button>
        </>
      )}
    </Card>
  );

  if (!canManageResetPassword(values)) {
    return null;
  }

  return (
    <>
      {(canSendEmail || canGenerateLink) && (
        <div className={`form-row`}>
          <Alert
            type="info"
            showIcon
            title="Reset de senha"
            description={
              <>
                <p style={{ marginTop: 0 }}>
                  O usuário recebe um link para cadastrar uma nova senha. O link
                  vale por 6 horas, só pode ser utilizado uma vez e toda
                  solicitação fica registrada no histórico abaixo.
                </p>
                <Button type="primary" onClick={() => openFlow()}>
                  Resetar senha do usuário
                </Button>
              </>
            }
          />
        </div>
      )}

      {canReadHistory && (
        <div className={`form-row`}>
          <Flex justify="space-between" align="center" gap={8} wrap>
            <div className="form-label">
              <label>Histórico de reset de senha:</label>
            </div>
            <Button
              size="small"
              onClick={() => loadHistory()}
              loading={historyLoading}
            >
              Atualizar
            </Button>
          </Flex>

          <div className="form-info" style={{ margin: "4px 0 8px" }}>
            Último acesso do usuário:{" "}
            <strong>
              {resetHistory?.lastLogin
                ? formatDateTime(resetHistory.lastLogin)
                : "Sem registro"}
            </strong>
          </div>

          <Table
            columns={historyColumns}
            dataSource={(resetHistory?.history || []).map((item, index) => ({
              ...item,
              key: index,
            }))}
            pagination={{ pageSize: 5, size: "small", hideOnSinglePage: true }}
            size="small"
            loading={historyLoading}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Nenhuma solicitação de reset de senha" }}
          />
        </div>
      )}

      <DefaultModal
        open={flowOpen}
        title="Reset de senha"
        onCancel={() => closeFlow()}
        footer={<Button onClick={() => closeFlow()}>Fechar</Button>}
        width={canSendEmail ? 900 : 600}
        destroyOnHidden
      >
        {canSendEmail && (
          <p style={{ marginTop: 0 }}>
            Existem duas formas de entregar o link ao usuário. Comece pelo
            email; use o link manual apenas se o email não chegar.
          </p>
        )}

        <Flex gap={16} align="stretch" wrap>
          {canSendEmail && (
            <div style={{ flex: "1 1 380px", minWidth: 0 }}>{emailOption}</div>
          )}
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>{linkOption}</div>
        </Flex>
      </DefaultModal>
    </>
  );
}
