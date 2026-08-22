import React from "react";
import { Flex } from "antd";
import { CopyOutlined, MailOutlined } from "@ant-design/icons";

import { Textarea } from "components/Inputs";
import Button from "components/Button";
import notification from "components/notification";

import { getGmailComposeUrl } from "./getGmailComposeUrl";

export const ResetPasswordLink = ({ link, name, email }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      notification.success({ message: "Link copiado!" });
    } catch {
      notification.error({
        message: "Não foi possível copiar o link. Copie manualmente.",
      });
    }
  };

  const openGmail = () => {
    window.open(
      getGmailComposeUrl({ email, name, link }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      <p>
        Cuidado ao disponibilizar este link. Confira se o usuário é legítimo.
        Encaminhe este link somente para o email do usuário que irá utilizá-lo.
      </p>
      <Textarea style={{ minHeight: "100px" }} value={link} readOnly></Textarea>
      <Flex gap="small" style={{ marginTop: "1rem" }}>
        <Button icon={<CopyOutlined />} onClick={copyToClipboard}>
          Copiar link
        </Button>
        <Button
          type="primary"
          icon={<MailOutlined />}
          onClick={openGmail}
          disabled={!email}
        >
          Enviar pelo Gmail
        </Button>
      </Flex>
      {!email && (
        <p style={{ marginTop: "0.5rem" }}>
          Este usuário não possui email cadastrado, por isso não é possível
          preparar o email automaticamente.
        </p>
      )}
    </>
  );
};
