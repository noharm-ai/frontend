import { useState } from "react";
import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";

import { IProtocolFormBaseFields } from "../Form/types";
import { BatchTest } from "./BatchTest";

interface ProtocolTestModalProps {
  open: boolean;
  onClose: () => void;
  protocol: IProtocolFormBaseFields;
}

export function ProtocolTestModal({
  open,
  onClose,
  protocol,
}: ProtocolTestModalProps) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  return (
    <DefaultModal
      title={t("titles.protocolTest")}
      destroyOnHidden
      open={open}
      onCancel={processing ? undefined : onClose}
      width="min(1200px, 96vw)"
      style={{ top: 20 }}
      styles={{ body: { height: "80vh", overflowY: "auto" } }}
      footer={null}
      closable={!processing}
      maskClosable={!processing}
    >
      <BatchTest
        protocol={protocol}
        processing={processing}
        setProcessing={setProcessing}
      />
    </DefaultModal>
  );
}
