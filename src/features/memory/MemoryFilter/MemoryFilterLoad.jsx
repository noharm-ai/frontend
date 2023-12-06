import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash.isempty";
import { List } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";

import Modal from "components/Modal";
import notification from "components/notification";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Empty from "components/Empty";
import { getErrorMessage } from "utils/errorHandler";
import { saveFilter, fetchFilter } from "./MemoryFilterSlice";

export default function MemoryFilterLoad({ setOpen, open, type, setFilter }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector(
    (state) => state.memoryFilter[type]?.status || "idle"
  );
  const [data, setData] = useState([]);

  useEffect(() => {
    if (open) {
      dispatch(fetchFilter(type)).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          if (!isEmpty(response.payload.data)) {
            setData([...response.payload.data[0].value]);
          }
        }
      });
    }
  }, [open, dispatch, t, type]);

  const removeItem = (index) => {
    const newArray = [...data];
    newArray.splice(index, 1);

    setData(newArray);
    dispatch(saveFilter({ type: type, value: newArray })).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({ message: "Filtro removido com sucesso." });
      }
    });
  };

  const applyFilter = (item) => {
    setFilter(item.data);
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      footer={[
        <Button key="back" onClick={() => setOpen(false)}>
          Fechar
        </Button>,
      ]}
    >
      <p>Escolha o filtro e clique em Aplicar</p>
      <List
        style={{ marginTop: "20px" }}
        loading={status === "loading"}
        itemLayout="horizontal"
      >
        {data.map((item, index) => (
          <List.Item
            key={index}
            actions={[
              <Tooltip title="Aplicar filtro">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => applyFilter(item)}
                >
                  Aplicar
                </Button>
              </Tooltip>,
              <Tooltip title="Excluir filtro">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(index)}
                  loading={status === "loading"}
                ></Button>
              </Tooltip>,
            ]}
          >
            {item.name}
          </List.Item>
        ))}
        {status !== "loading" && !data.length && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhum filtro encontrado."
          />
        )}
      </List>
    </Modal>
  );
}
