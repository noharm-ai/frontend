import { useEffect, useState } from "react";
import { Alert, Button, Empty, List, Modal, Space, Spin, Tag, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  PrinterOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { escape as escapeHtml } from "lodash";

import { useAppSelector, useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { getMemory } from "features/lists/ListsSlice";
import { formatDate } from "utils/date";

import {
  fetchClinicalNotesByPrescription,
  setListModalClose,
  setFormModalOpen,
  IClinicalNoteItem,
} from "../ClinicalNotesSlice";
import { ClinicalNotesForm } from "../ClinicalNotesForm/ClinicalNotesForm";

interface IClinicalNotesListProps {
  afterSave?: () => void;
}

export function ClinicalNotesList({ afterSave }: IClinicalNotesListProps) {
  const dispatch = useAppDispatch();
  const [legacyNoteOpen, setLegacyNoteOpen] = useState(false);

  const listModal = useAppSelector(
    (state) => state.clinicalNotesMulti.listModal,
  );
  const list = useAppSelector((state) => state.clinicalNotesMulti.list);
  const legacyNote = useAppSelector(
    (state) =>
      (state.prescriptions as any).single?.data?.notes as string | undefined,
  );

  useEffect(() => {
    if (listModal.open && listModal.idPrescription) {
      dispatch(fetchClinicalNotesByPrescription(listModal.idPrescription));
    }
  }, [dispatch, listModal.open, listModal.idPrescription]);

  useEffect(() => {
    if (list.status === "succeeded" && list.data.length === 0 && !legacyNote) {
      dispatch(setFormModalOpen({ selectedNote: null }));
    }
  }, [dispatch, list.status, list.data.length, legacyNote]);

  const handleClose = () => {
    dispatch(setListModalClose());
  };

  const handleNewNote = () => {
    dispatch(setFormModalOpen({ selectedNote: null }));
  };

  const handleEditNote = (item: IClinicalNoteItem) => {
    dispatch(setFormModalOpen({ selectedNote: item }));
  };

  const printNote = (item: IClinicalNoteItem) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      notification.error({ message: "Desative o bloqueador de popups" });
      return;
    }

    dispatch((getMemory as any)({ type: "nav-header" })).then((result: any) => {
      const navHeaderText = result.payload?.data?.[0]?.value?.header ?? "";
      const noteHeader = escapeHtml(
        `${formatDate(item.updatedAt, "DD/MM/YYYY HH:mm")} — ${item.createdByName ?? item.userName ?? ""}`,
      );

      printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Evolução — ${noteHeader}</title>
    <style>
      @page { margin: 24px; }
      body { padding: 24px; font-family: sans-serif; }
      .print-institution-header {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; border-bottom: 1px solid #ccc;
        padding-bottom: 12px; margin-bottom: 12px;
      }
      .print-institution-header p { margin: 0; font-size: 13px; }
      .print-note-header { font-size: 14px; font-weight: bold; margin-bottom: 12px; margin-top: 30px; }
      .print-note-content { font-size: 13px; white-space: pre-wrap; }
      p { orphans: 3; widows: 3; }
    </style>
  </head>
  <body>
    <div class="print-institution-header">
      <img src="/logo512.png" style="width:30px;margin-bottom:8px" alt="NoHarm.ai" />
      ${navHeaderText}
    </div>
    <div class="print-note-header">${noteHeader}</div>
    <div class="print-note-content">${escapeHtml(item.notes ?? "")}</div>
    <script>window.onload = function() { window.print(); window.close(); }</script>
  </body>
</html>`);
      printWindow.document.close();
    });
  };

  const handleFormCancel = () => {
    if (list.data.length === 0) {
      dispatch(setListModalClose());
    }
  };

  const renderBody = () => {
    if (list.status === "loading") {
      return (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin />
        </div>
      );
    }

    if (list.status === "failed") {
      return (
        <Alert
          type="error"
          message="Erro ao carregar evoluções"
          description={list.error ?? undefined}
        />
      );
    }

    if (list.status === "succeeded" && list.data.length === 0) {
      if (legacyNote) {
        return (
          <Alert
            type="info"
            showIcon
            description={
              <>
                Esta prescrição possui uma evolução anterior ao novo sistema de
                evoluções.{" "}
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0 }}
                  onClick={() => setLegacyNoteOpen(true)}
                >
                  Ver evolução
                </Button>
              </>
            }
          />
        );
      }
      return <Empty description="Nenhuma evolução registrada" />;
    }

    return (
      <>
        <List
          dataSource={list.data}
          renderItem={(item: IClinicalNoteItem) => (
            <List.Item
              key={item.id}
              actions={[
                ...(PermissionService().has(Permission.READ_NAV)
                  ? [
                      <Tooltip title="Imprimir" key="print">
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => printNote(item)}
                        >
                          Imprimir
                        </Button>
                      </Tooltip>,
                    ]
                  : []),
                <Button
                  icon={<EditOutlined />}
                  key="edit"
                  onClick={() => handleEditNote(item)}
                >
                  Editar
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    {formatDate(item.updatedAt, "DD/MM/YYYY HH:mm")}
                    {item.createdByName && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#888",
                          fontWeight: 400,
                        }}
                      >
                        — {item.createdByName}
                      </span>
                    )}
                    {item.tpStatus === 1 && (
                      <Tooltip
                        title={`Enviado ao sistema institucional em ${formatDate(item.sentAt, "DD/MM/YYYY HH:mm")}`}
                      >
                        <Tag
                          icon={<CheckCircleOutlined />}
                          color="success"
                          style={{ marginLeft: 8 }}
                        >
                          Integrado
                        </Tag>
                      </Tooltip>
                    )}
                    {item.tpStatus === 2 && (
                      <Tooltip title="Erro na integração com o sistema institucional. Salve o registro novamente para reenviar.">
                        <Tag
                          icon={<WarningOutlined />}
                          color="error"
                          style={{ marginLeft: 8 }}
                        >
                          Erro na integração
                        </Tag>
                      </Tooltip>
                    )}
                  </span>
                }
                description={
                  item.notes?.length > 120
                    ? `${item.notes.substring(0, 120)}…`
                    : item.notes
                }
              />
            </List.Item>
          )}
        />
        {legacyNote && (
          <Alert
            style={{ marginTop: 16 }}
            type="info"
            showIcon
            description={
              <>
                Esta prescrição possui uma evolução anterior ao novo sistema de
                evoluções.{" "}
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0 }}
                  onClick={() => setLegacyNoteOpen(true)}
                >
                  Ver evolução
                </Button>
              </>
            }
          />
        )}
      </>
    );
  };

  return (
    <>
      <DefaultModal
        title="Evoluções"
        width={700}
        centered
        destroyOnHidden
        open={listModal.open}
        onCancel={handleClose}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Space>
              <Button onClick={handleClose}>Fechar</Button>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={handleNewNote}
              >
                Nova Evolução
              </Button>
            </Space>
          </div>
        }
      >
        {renderBody()}
      </DefaultModal>

      <ClinicalNotesForm afterSave={afterSave} onCancel={handleFormCancel} />

      <Modal
        title="Evolução anterior (migração)"
        open={legacyNoteOpen}
        onCancel={() => setLegacyNoteOpen(false)}
        footer={
          <Button onClick={() => setLegacyNoteOpen(false)}>Fechar</Button>
        }
        centered
        width={600}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{legacyNote}</p>
      </Modal>
    </>
  );
}
