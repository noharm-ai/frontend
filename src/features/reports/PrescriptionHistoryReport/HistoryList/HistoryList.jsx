import React from "react";
import { useSelector } from "react-redux";
import { InfoCircleOutlined } from "@ant-design/icons";

import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import Button from "components/Button";
import DefaultModal from "components/Modal";

export default function HistoryList() {
  const datasource = useSelector(
    (state) => state.reportsArea.prescriptionHistory.filtered.result.list
  );

  const columns = [
    {
      title: "Data",
      width: 160,
      align: "center",
      sorter: (a, b) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
      render: (_, record) => formatDateTime(record.createdAt),
    },
    {
      title: "Evento",
      render: (_, record) => {
        if (record.source === "PrescriptionAudit") {
          switch (record.type) {
            case 1:
              if (!record.responsible) {
                return "Prescrição checada automaticamente";
              }

              return "Prescrição checada";

            case 2:
              if (!record.responsible) {
                return "Desfazer checagem (novos itens)";
              }

              return "Desfazer checagem";

            case 3:
              return "Prescrição revisada";

            case 4:
              return "Desfazer revisão";

            case 5:
              return "Evolução enviada ao PEP";

            case 6:
              return "Checagem enviada ao PEP";

            case 7:
              return "Registro/Atualização de evolução";

            case 8:
              return "Criação do Paciente-Dia (prescrição do paciente)";

            case 9:
              return "Erro no envio de checagem ao PEP";

            case 10:
              return "Integração de intervenção";

            case 11:
              return "Erro na integração de evolução";
            case 12:
              return "Checagem enviada ao PEP (Passo 2)";

            default:
              return `Não definido: ${record.type}-${record.source}`;
          }
        }

        if (record.source === "custom") {
          switch (record.type) {
            case 1:
              return "Prescrição criada";

            case 2:
              return "Prescrição chegou na NoHarm";

            case 3:
              return "Processada (prescalc)";

            default:
              return `Não definido: ${record.type}-${record.source}`;
          }
        }
      },
    },
    {
      title: "Responsável",
      render: (_, record) => record.responsible || "NoHarm",
    },
    {
      title: "Detalhes",
      align: "center",
      render: (_, record) => {
        if (record.extra) {
          const openModal = () => {
            DefaultModal.info({
              title: "Detalhes do evento",
              content: (
                <div
                  style={{
                    overflow: "auto",
                    background: "#e0e0e0",
                    padding: "5px",
                  }}
                >
                  <pre>{JSON.stringify(record.extra, null, 2)}</pre>
                </div>
              ),
              icon: null,
              width: 500,
              okText: "Fechar",
              okButtonProps: { type: "default" },
              wrapClassName: "default-modal",
              mask: { blur: false },
            });
          };

          return (
            <Button
              icon={<InfoCircleOutlined />}
              size="medium"
              onClick={openModal}
            />
          );
        }

        return "-";
      },
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey="id"
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}
