import React, { useState, useEffect } from "react";
import isEmpty from "lodash.isempty";
import { EditOutlined } from "@ant-design/icons";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Switch from "components/Switch";
import { Input, Textarea } from "components/Inputs";
import Button from "components/Button";

import { ConfigModalContainer } from "./ConfigModal.style";

export default function ConfigModal({ save, open, setOpen, list }) {
  const [dataSource, setDataSource] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

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

  return (
    <Modal
      visible={open}
      width={700}
      onCancel={() => setOpen(false)}
      onOk={() => saveAction()}
      okText="Salvar"
      okType="primary gtm-bt-memorytext-savemodal"
      cancelText="Cancelar"
    >
      <Heading size="16px" className="fixed" style={{ marginBottom: "15px" }}>
        Gerenciar Textos Padrão
      </Heading>

      <ConfigModalContainer>
        {dataSource.map((item, index) => (
          <div key={index}>
            <div class="main">
              <div>
                <Input
                  value={item.name}
                  onChange={({ target }) => setName(target.value, index)}
                  maxLength={50}
                />
              </div>
              <div>
                <Switch
                  onChange={(active) => setItem(active, index)}
                  checked={item.active}
                />
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
            <div className={`detail ${openIndex === index ? "active" : ""}`}>
              <Textarea
                autoFocus
                value={item.data}
                onChange={({ target }) => setData(target.value, index)}
              />
            </div>
          </div>
        ))}
      </ConfigModalContainer>
    </Modal>
  );
}
