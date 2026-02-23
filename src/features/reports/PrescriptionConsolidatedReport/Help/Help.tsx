import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import Modal from "components/Modal";
import Alert from "components/Alert";

import { setHelpModal } from "../PrescriptionConsolidatedReportSlice";

export function HelpModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(
    (state) => state.reportsArea.prescriptionConsolidated.helpModal,
  );
  const updatedAt = useAppSelector(
    (state) =>
      state.reportsArea.prescriptionConsolidated.filtered.result.updatedAt,
  );

  return (
    <Modal
      open={open}
      width={500}
      onCancel={() => dispatch(setHelpModal(false))}
      footer={null}
    >
      <div className="modal-title">Informações</div>

      <p>
        Este relatório apresenta as métricas de avaliação de{" "}
        <strong>Prescrições</strong> no formato{" "}
        <strong>consolidado</strong>.
      </p>

      <p>
        Nele, você consegue visualizar períodos mais longos, mas sem os mesmos
        detalhes do relatório de Prescrições (por exemplo, não é possível
        visualizar os registros individuais).
      </p>

      <Alert
        description={`Atualizado em: ${dayjs(updatedAt).format("DD/MM/YY HH:mm")}`}
        type="info"
        showIcon
      />
    </Modal>
  );
}
