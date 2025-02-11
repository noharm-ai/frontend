import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Popconfirm } from "antd";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Switch from "components/Switch";
import { Input, Textarea } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Empty from "components/Empty";

import { ConfigModalContainer } from "./ConfigModal.style";

export default function ConfigModal({ save, open, setOpen, list }) {
  const [dataSource, setDataSource] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (list && list[0]) {
      setDataSource(
        list[0].value.map((i) => {
          return {
            ...i,
            active: i.hasOwnProperty("active") ? i.active : true,
          };
        })
      );
    }
  }, [list]);

  const saveAction = () => {
    save(dataSource);
    setOpen(false);
  };

  const setItem = (value, index) => {
    dataSource[index].active = value;
    setDataSource([...dataSource]);
  };

  const setName = (value, index) => {
    dataSource[index].name = value;
    setDataSource([...dataSource]);
  };

  const setData = (value, index) => {
    dataSource[index].data = value;
    setDataSource([...dataSource]);
  };

  if (isEmpty(dataSource)) {
    return;
  }

  const isEmptyDs =
    dataSource.filter((item) => item.active === active).length === 0;

  return (
    <Modal
      open={open}
      width={700}
      onCancel={() => setOpen(false)}
      onOk={() => saveAction()}
      okText="Salvar"
      okType="primary"
      cancelText="Cancelar"
    >
      <Heading $size="16px" className="fixed" style={{ marginBottom: "15px" }}>
        Gerenciar Textos Padrão
      </Heading>

      <ConfigModalContainer>
        {isEmptyDs ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhum filtro encontrado."
          />
        ) : (
          <>
            {dataSource.map((item, index) => (
              <React.Fragment key={index}>
                {item.active === active && (
                  <div>
                    <div className="main">
                      <div>
                        <Input
                          value={item.name}
                          onChange={({ target }) =>
                            setName(target.value, index)
                          }
                          maxLength={50}
                        />
                      </div>
                      <div>
                        {active ? (
                          <Popconfirm
                            title="Remover texto padrão"
                            description="Confirma a remoção deste texto?"
                            okText="Sim"
                            cancelText="Não"
                            onConfirm={() => setItem(!active, index)}
                            zIndex={9999}
                          >
                            <Button danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ) : (
                          <Tooltip title="Ativar texto padrão">
                            <Button
                              icon={<CheckCircleOutlined />}
                              onClick={() => setItem(!active, index)}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <div>
                        <Button
                          ghost={index !== openIndex}
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() =>
                            setOpenIndex(index === openIndex ? null : index)
                          }
                        />
                      </div>
                    </div>
                    <div
                      className={`detail ${
                        openIndex === index ? "active" : ""
                      }`}
                    >
                      <Textarea
                        autoFocus
                        value={item.data}
                        onChange={({ target }) => setData(target.value, index)}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </ConfigModalContainer>
      <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
        <label style={{ marginRight: "10px" }}>Exibindo:</label>
        <Switch
          onChange={(value) => setActive(value)}
          checked={active}
          checkedChildren="Textos ativos"
          unCheckedChildren="Textos Inativos"
        />
      </div>
    </Modal>
  );
}
