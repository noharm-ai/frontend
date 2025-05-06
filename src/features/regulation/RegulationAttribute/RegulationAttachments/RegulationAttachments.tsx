import { useEffect, useState } from "react";
import { Card, TableProps, Table, Popconfirm, Descriptions } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useAppSelector, useAppDispatch } from "src/store";
import { listAttachments, removeAttribute } from "../RegulationAttributeSlice";
import { RegulationAttributeType } from "src/models/regulation/RegulationAttributeType";
import { formatDateTime } from "src/utils/date";
import { RegulationAttachmentForm } from "./RegulationAttachmentForm";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";

interface IRegulationAttachmentProps {
  idRegSolicitation: number;
  print?: boolean;
}

interface IAttachment {
  id: number;
  tpAttribute: number;
  status: number;
  value: any;
  createdAt: string;
  createdBy: string;
}

export function RegulationAttachments({
  idRegSolicitation,
  print = false,
}: IRegulationAttachmentProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const attachments = useAppSelector(
    (state) => state.regulation.regulationAttribute.attachments.list
  );
  const status: any = useAppSelector(
    (state) => state.regulation.regulationAttribute.attachments.status
  );
  const [formModal, setFormModal] = useState<boolean>(false);

  useEffect(() => {
    if (idRegSolicitation && !print) {
      dispatch(
        listAttachments({
          idRegSolicitation,
          tpAttribute: RegulationAttributeType.ATTACHMENT,
        })
      );
    }
  }, [idRegSolicitation, print, dispatch]);

  const closeForm = () => {
    setFormModal(false);
    dispatch(
      listAttachments({
        idRegSolicitation,
        tpAttribute: RegulationAttributeType.ATTACHMENT,
      })
    );
  };

  const onRemoveAttribute = (id: number) => {
    dispatch(removeAttribute({ id })).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Anexo removido com sucesso",
        });

        dispatch(
          listAttachments({
            idRegSolicitation,
            tpAttribute: RegulationAttributeType.ATTACHMENT,
          })
        );
      }
    });
  };

  const columns: TableProps<IAttachment>["columns"] = [
    {
      title: "Data",
      align: "center",
      render: (_, record) =>
        record.createdAt ? formatDateTime(record.createdAt) : "--",
    },
    {
      title: "Descrição",
      align: "left",
      render: (_, record: any) => record.value.name,
    },
    {
      title: "Link",
      render: (_, record) => {
        return (
          <a href={record.value.link} target="_blank" rel="norerefer noopener">
            {record.value.link}
          </a>
        );
      },
    },

    {
      title: "Responsável",
      align: "center",
      render: (_, record) => record.createdBy ?? "-",
    },
    {
      title: "Ações",
      width: 70,
      align: "center",
      render: (_, record) => {
        return (
          <Popconfirm
            title="Remover anexo"
            description="Confirma a remoção deste anexo?"
            okText="Sim"
            cancelText="Não"
            onConfirm={() => onRemoveAttribute(record.id)}
            zIndex={9999}
          >
            <Button danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        );
      },
    },
  ];

  if (print) {
    const items = attachments.map((a) => ({
      key: a.id,
      label: a.value.name,
      children: a.value.link,
      span: 4,
    }));

    return (
      <Card title="Anexos" bordered={false}>
        <Descriptions bordered items={items} column={4} size="middle" />
      </Card>
    );
  }

  return (
    <Card
      title="Anexos"
      bordered={false}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFormModal(true)}
        >
          Adicionar
        </Button>
      }
    >
      <Table<IAttachment>
        bordered
        columns={columns}
        rowKey="id"
        loading={status === "loading"}
        dataSource={attachments.length === 0 ? [] : attachments}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {attachments?.length} registro(s)
          </div>
        )}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
      <RegulationAttachmentForm
        open={formModal}
        close={closeForm}
        idRegSolicitation={idRegSolicitation}
      />
    </Card>
  );
}
