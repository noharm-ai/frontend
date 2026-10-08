import { useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import { resetAIForm } from "features/support/SupportSlice";

import { SupportFormAI } from "../SupportFormAI/SupportFormAI";

interface ISupportAIModalProps {
  open: boolean;
  onClose: () => void;
}

/** Modal where the user asks the n0 support agent a question. */
export function SupportAIModal({ open, onClose }: ISupportAIModalProps) {
  const dispatch = useAppDispatch();

  return (
    <DefaultModal
      width={850}
      centered
      footer={null}
      open={open}
      destroyOnHidden
      onCancel={() => {
        dispatch(resetAIForm());
        onClose();
      }}
    >
      <header>
        <h2 className="modal-title">Agente de Suporte (IA)</h2>
      </header>
      <p>Tem alguma dúvida? Descreva no campo abaixo e a IA tentará ajudar:</p>
      <SupportFormAI mode="simple" />
    </DefaultModal>
  );
}
