import React from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import { HistoryOutlined, DownloadOutlined } from "@ant-design/icons";
import { List, Avatar } from "antd";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";

export default function HistoryModal({
  availableReports,
  loadArchive,
  open,
  setOpen,
}) {
  const dispatch = useDispatch();

  const items = availableReports
    ? availableReports.map((r) => ({
        title: r,
      }))
    : [];

  const load = (filename) => {
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
        size="18px"
        className="fixed"
        style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}
      >
        Histórico
      </Heading>

      <p>
        Através desta funcionalidade, você possui acesso aos relatórios de
        períodos anteriores ao atual. Clique no período que deseja visualizar:
      </p>

      <List
        itemLayout="horizontal"
        dataSource={items || []}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                onClick={() => load(item.title)}
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
              title={dayjs(item.title)
                .subtract(1, "day")
                .format("MMMM / YYYY")
                .toUpperCase()}
            />
          </List.Item>
        )}
      />
      <p style={{ opacity: 0.7, fontSize: "12px" }}>
        * Períodos anteriores à ativação do relatório não estão disponíveis.
      </p>
    </Modal>
  );
}
