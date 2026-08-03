import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import { ProtocolTrace } from "components/Screening/Patient/Card/ProtocolTrace/ProtocolTrace";
import type { IPrescriptionTrace } from "components/Screening/Patient/Card/ProtocolTrace/types";

interface TestDetailModalProps {
  trace: IPrescriptionTrace | null;
  onClose: () => void;
}

export function TestDetailModal({ trace, onClose }: TestDetailModalProps) {
  const { t } = useTranslation();

  return (
    <DefaultModal
      title={t("titles.protocolTrace")}
      destroyOnHidden
      open={trace != null}
      onCancel={onClose}
      width="min(1200px, 96vw)"
      style={{ top: 20 }}
      styles={{
        container: { paddingLeft: 0, paddingRight: 0, paddingBottom: 0 },
        header: { paddingLeft: 24, paddingRight: 24 },
        body: { height: "80vh", padding: 0 },
      }}
      footer={null}
    >
      {trace && <ProtocolTrace trace={trace} />}
    </DefaultModal>
  );
}
