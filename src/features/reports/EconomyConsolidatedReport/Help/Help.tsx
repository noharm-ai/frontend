import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import Modal from "components/Modal";
import Alert from "components/Alert";

import { setHelpModal } from "../EconomyConsolidatedReportSlice";

export function HelpModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(
    (state) => state.reportsArea.economyConsolidated.helpModal,
  );
  const updatedAt = useAppSelector(
    (state) => state.reportsArea.economyConsolidated.filtered.result.updatedAt,
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
        Este relatório apresenta a economia calculada a partir das intervenções
        aplicadas, no formato <strong>consolidado</strong>.
      </p>

      <p>
        Nele, você consegue visualizar períodos mais longos, mas sem os mesmos
        detalhes do relatório de Farmacoeconomia (por exemplo, não é possível
        visualizar os registros individuais nem filtrar por medicamento).
      </p>

      <p>
        O valor de cada dia corresponde à soma do valor de economia/dia de todas
        as intervenções com economia ativa naquele dia, respeitando o período
        selecionado.
      </p>

      <Alert
        description={`Atualizado em: ${
          updatedAt ? dayjs(updatedAt).format("DD/MM/YY HH:mm") : "-"
        }`}
        type="info"
        showIcon
      />
    </Modal>
  );
}
