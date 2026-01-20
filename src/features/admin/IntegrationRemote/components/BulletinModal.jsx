import React from "react";
import { useDispatch, useSelector } from "react-redux";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import { setBulletinModal } from "../IntegrationRemoteSlice";
import { CardTable } from "components/Table";
import RichTextView from "components/RichTextView";

export default function BulletinModal() {
  const dispatch = useDispatch();
  const data = useSelector(
    (state) => state.admin.integrationRemote.template.bulletin
  );
  const open = useSelector(
    (state) => state.admin.integrationRemote.modal.bulletin
  );

  const datasource = data?.bulletinBoard?.bulletins ?? [];

  const columns = [
    {
      title: "Hora",
      align: "center",
      render: (_, record) => record.timestamp,
    },
    {
      title: "Categoria",
      render: (_, record) => record.bulletin.category,
    },
    {
      title: "Origem",
      render: (_, record) => record.bulletin.sourceName,
    },
    {
      title: "Level",
      render: (_, record) => record.bulletin.level,
    },
    {
      title: "Mensagem",
      render: (_, record) => <RichTextView text={record.bulletin.message} />,
    },
  ];

  return (
    <DefaultModal
      width={"80vw"}
      centered
      destroyOnHidden
      open={open}
      onCancel={() => dispatch(setBulletinModal(null))}
      footer={null}
    >
      <Heading style={{ marginBottom: "20px" }} $size="18px">
        Bulletin Board
      </Heading>

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
    </DefaultModal>
  );
}
