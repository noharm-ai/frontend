import React from "react";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";

function SummaryPanelAIAudit({ audit, open, setOpen }) {
  return (
    <DefaultModal
      width={700}
      centered
      destroyOnClose
      onCancel={() => setOpen(false)}
      open={open}
      footer={null}
    >
      <Heading>Auditoria</Heading>
      <p>Lista de registros encontrados pela IA.</p>
      <ul>
        {audit?.length ? (
          audit.map((a, i) => <li key={i}>{a}</li>)
        ) : (
          <li>Nenhum registro encontrado</li>
        )}
      </ul>
    </DefaultModal>
  );
}

export default SummaryPanelAIAudit;
