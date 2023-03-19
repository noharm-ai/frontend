import React, { useState, useEffect } from "react";
import isEmpty from "lodash.isempty";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Switch from "components/Switch";

import { ConfigModalContainer } from "./ConfigModal.style";

export default function ConfigModal({ save, open, setOpen, list }) {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    if (list && list[0])
      setDataSource(
        list[0].value.map((i) => {
          return {
            ...i,
            active: i.hasOwnProperty("active") ? i.active : true,
          };
        })
      );
  }, [list]);

  const saveAction = () => {
    save(dataSource);
    setOpen(false);
  };

  const setItem = (value, index) => {
    dataSource[index].active = value;
    setDataSource([...dataSource]);
  };

  if (isEmpty(dataSource)) {
    return;
  }

  return (
    <Modal
      visible={open}
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
            <div>{item.name}</div>
            <div>
              <Switch
                onChange={(active) => setItem(active, index)}
                checked={item.active}
              />
            </div>
          </div>
        ))}
      </ConfigModalContainer>
    </Modal>
  );
}
