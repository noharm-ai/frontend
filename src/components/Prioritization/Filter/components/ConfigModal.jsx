import React from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, Tabs } from "antd";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Button from "components/Button";
import Empty from "components/Empty";

import { ConfigModalContainer } from "./ConfigModal.style";

export default function ConfigModal({
  open,
  setOpen,
  privateFilters,
  publicFilters,
  removeFilterAction,
  filterActive,
}) {
  const FilterList = ({ list, type }) => {
    const filters = list && list[0]?.value ? list[0].value : [];

    if (filters.filter((item) => filterActive(item)).length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhum filtro encontrado."
        />
      );
    }

    return (
      <ConfigModalContainer>
        {list?.length &&
          list[0].value.map((item, index) => (
            <React.Fragment key={index}>
              {filterActive(item) && (
                <div key={index}>
                  <div className="main">
                    <div>{item.name}</div>
                    <div>
                      <Popconfirm
                        title="Remover filtro"
                        description="Confirma a remoção deste filtro?"
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => removeFilterAction(index, type)}
                        zIndex={9999}
                      >
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
      </ConfigModalContainer>
    );
  };

  const items = [
    {
      key: "1",
      label: "Privados",
      children: <FilterList list={privateFilters} type="private" />,
    },
    {
      key: "2",
      label: "Públicos",
      children: <FilterList list={publicFilters} type="public" />,
    },
  ];

  return (
    <Modal
      open={open}
      width={700}
      footer={null}
      onCancel={() => setOpen(false)}
    >
      <Heading $size="16px" className="fixed" style={{ marginBottom: "15px" }}>
        Gerenciar Filtros
      </Heading>

      <Tabs
        defaultActiveKey="1"
        style={{ marginTop: "20px" }}
        items={items}
      ></Tabs>
    </Modal>
  );
}
