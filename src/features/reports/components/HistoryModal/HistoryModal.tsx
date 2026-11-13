import type { UnknownAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { HistoryOutlined, DownloadOutlined } from "@ant-design/icons";
import { List, Avatar } from "antd";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";
import Alert from "components/Alert";
import { formatDate } from "utils/date";
import { useAppDispatch } from "src/store";

export interface AvailableReport {
  name: string;
  updateAt?: string | null;
}

interface HistoryModalProps {
  availableReports?: AvailableReport[] | null;
  loadArchive: (filename: string) => void;
  open: boolean;
  setOpen: (open: boolean) => UnknownAction;
  onOpenYearlyReport?: (() => void) | null;
}

export function HistoryModal({
  availableReports,
  loadArchive,
  open,
  setOpen,
  onOpenYearlyReport = null,
}: HistoryModalProps) {
  const dispatch = useAppDispatch();

  const load = (filename: string) => {
    loadArchive(filename);
    dispatch(setOpen(false));
  };

  return (
    <Modal
      open={open}
      width={500}
      onCancel={() => dispatch(setOpen(false))}
      footer={null}
    >
      <Heading
        $size="18px"
        className="fixed"
        style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}
      >
        Histórico
      </Heading>

      {onOpenYearlyReport && (
        <Alert
          type="info"
          showIcon
          style={{ marginTop: "16px" }}
          description={
            <>
              <strong>Relatório Anual disponível</strong>
              <br />
              Para visualizar períodos mais longos com dados agregados, acesse o
              Relatório Anual.{" "}
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => onOpenYearlyReport()}
              >
                Acessar Relatório Anual
              </Button>
            </>
          }
        />
      )}

      <p>
        Através desta funcionalidade, você possui acesso aos relatórios de
        períodos anteriores ao atual. Clique no período que deseja visualizar:
      </p>

      <List
        itemLayout="horizontal"
        pagination={{ pageSize: 5, size: "small" }}
        dataSource={availableReports || []}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                onClick={() => load(item.name)}
                icon={<DownloadOutlined />}
              >
                Visualizar
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<HistoryOutlined />}
                  style={{ backgroundColor: "#a991d6", color: "#fff" }}
                />
              }
              title={dayjs(item.name)
                .subtract(1, "day")
                .format("MMMM / YYYY")
                .toUpperCase()}
              description={`Foto retirada em ${formatDate(item.updateAt)}`}
            />
          </List.Item>
        )}
      />

      <p style={{ opacity: 0.7, fontSize: "12px" }}>
        * Cada arquivo histórico possui 2 meses de dados.
        <br />* Períodos anteriores à ativação do relatório não estão
        disponíveis.
      </p>
    </Modal>
  );
}
