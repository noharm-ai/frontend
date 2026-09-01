import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Input, Spin, Typography } from "antd";
import { CopyOutlined, LinkOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import {
  closeDigitalSignature,
  requestDigitalSignature,
} from "./DigitalSignatureSlice";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function DigitalSignature() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const note = useSelector((state: any) => state.digitalSignature.note);
  const request = useSelector((state: any) => state.digitalSignature.request);
  const account = useSelector((state: any) => state.user.account);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [prevNote, setPrevNote] = useState(note);

  const isLoading = request.status === "loading";
  const isDone = request.status === "succeeded";
  const result = request.result;

  // prefill the signer with the logged user when the modal opens
  if (note !== prevNote) {
    setPrevNote(note);
    if (note) {
      setSignerName(account?.userName ?? "");
      setSignerEmail(account?.email ?? "");
    }
  }

  const handleClose = () => {
    dispatch(closeDigitalSignature());
  };

  const handleSend = async () => {
    if (!signerName.trim() || !EMAIL_REGEX.test(signerEmail.trim())) {
      notification.error({ message: t("digitalSignature.validationSigner") });
      return;
    }

    const actionResult: any = await dispatch(
      requestDigitalSignature({
        id: note.id,
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
      }) as any,
    );

    if (actionResult.error) {
      notification.error({ message: getErrorMessage(actionResult, t) });
      return;
    }

    notification.success({ message: t("digitalSignature.successMessage") });
  };

  const copyLink = () => {
    if (result?.link) {
      navigator.clipboard.writeText(result.link);
      notification.success({ message: t("digitalSignature.linkCopied") });
    }
  };

  return (
    <DefaultModal
      title={t("digitalSignature.title")}
      open={!!note}
      onCancel={handleClose}
      width={520}
      centered
      destroyOnHidden
      maskClosable={false}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleClose}>
            {t("digitalSignature.btnClose")}
          </Button>
          {!isDone && (
            <Button
              type="primary"
              onClick={handleSend}
              loading={isLoading}
              disabled={isLoading}
            >
              {t("digitalSignature.btnSend")}
            </Button>
          )}
        </div>
      }
    >
      <Spin spinning={isLoading}>
        {!isDone && (
          <>
            <p>{t("digitalSignature.description")}</p>
            <div style={{ marginBottom: "12px" }}>
              <label>{t("digitalSignature.signerName")}</label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                maxLength={250}
              />
            </div>
            <div>
              <label>{t("digitalSignature.signerEmail")}</label>
              <Input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                maxLength={254}
              />
            </div>
          </>
        )}
        {isDone && (
          <>
            <Alert
              type="success"
              showIcon
              message={t("digitalSignature.successMessage")}
              style={{ marginBottom: "16px" }}
            />
            {result?.link && (
              <>
                <p>{t("digitalSignature.linkLabel")}</p>
                <Typography.Text
                  ellipsis
                  copyable={false}
                  style={{ display: "block", marginBottom: "12px" }}
                >
                  {result.link}
                </Typography.Text>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button icon={<CopyOutlined />} onClick={copyLink}>
                    {t("digitalSignature.btnCopyLink")}
                  </Button>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(result.link, "_blank")}
                  >
                    {t("digitalSignature.btnOpenLink")}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </Spin>
    </DefaultModal>
  );
}
