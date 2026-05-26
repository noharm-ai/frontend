import { useEffect } from "react";
import { Alert, Button, Empty, List, Space, Spin } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import { useAppSelector, useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
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

  const listModal = useAppSelector(
    (state) => state.clinicalNotesMulti.listModal,
  );
  const list = useAppSelector((state) => state.clinicalNotesMulti.list);

  useEffect(() => {
    if (listModal.open && listModal.idPrescription) {
      dispatch(fetchClinicalNotesByPrescription(listModal.idPrescription));
    }
  }, [dispatch, listModal.open, listModal.idPrescription]);

  useEffect(() => {
    if (list.status === "succeeded" && list.data.length === 0) {
      dispatch(setFormModalOpen({ selectedNote: null }));
    }
  }, [dispatch, list.status, list.data.length]);

  const handleClose = () => {
    dispatch(setListModalClose());
  };

  const handleNewNote = () => {
    dispatch(setFormModalOpen({ selectedNote: null }));
  };

  const handleEditNote = (item: IClinicalNoteItem) => {
    dispatch(setFormModalOpen({ selectedNote: item }));
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
      return <Empty description="Nenhuma evolução registrada" />;
    }

    return (
      <List
        dataSource={list.data}
        renderItem={(item: IClinicalNoteItem) => (
          <List.Item
            key={item.id}
            actions={[
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
                  {formatDate(item.createdAt, "DD/MM/YYYY HH:mm")}
                  {item.createdByName && (
                    <span
                      style={{ marginLeft: 8, color: "#888", fontWeight: 400 }}
                    >
                      — {item.createdByName}
                    </span>
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
    </>
  );
}
