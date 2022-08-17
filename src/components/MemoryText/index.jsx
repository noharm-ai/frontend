import React, { useState, useEffect } from "react";
import isEmpty from "lodash.isempty";
import { FileTextOutlined } from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Menu from "components/Menu";
import Tooltip from "components/Tooltip";
import Button from "components/Button";

import SaveModal from "./components/SaveModal";

export default function MemoryText({
  fetch,
  save,
  storeId,
  memoryType,
  memory,
  content,
  onLoad,
  canSave = true,
}) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const { isFetching, list } = memory[storeId] || {
    isFetching: true,
    list: [],
  };

  useEffect(() => {
    fetch(storeId, memoryType);
  }, [fetch, storeId, memoryType]);

  const saveCurrent = (name) => {
    const hasMemory = list.length > 0;
    const texts = hasMemory ? [...list[0].value] : [];
    texts.push({
      name,
      data: content,
    });

    save(storeId, {
      id: hasMemory ? list[0].key : null,
      type: memoryType,
      value: texts,
    });
  };

  const loadText = (text) => {
    onLoad(text);
  };

  const mainMenu = () => {
    if (canSave) {
      return (
        <Menu forceSubMenuRender={true}>
          {textMenu()}

          <Menu.Divider />
          <Menu.Item onClick={() => setSaveModalOpen(true)} disabled={!content}>
            <span>Salvar texto atual</span>
          </Menu.Item>
        </Menu>
      );
    }

    return <Menu forceSubMenuRender={true}>{textMenu()}</Menu>;
  };

  const textMenu = () => {
    const title = "Aplicar";

    if (isEmpty(list) || isEmpty(list[0].value)) {
      return (
        <Menu.SubMenu title={title}>
          <Menu.Item disabled>Nenhum texto padrão encontrado.</Menu.Item>
        </Menu.SubMenu>
      );
    }

    return (
      <Menu.SubMenu title={title}>
        {list[0].value.map((item, index) => (
          <Menu.Item
            key={index}
            onClick={() => loadText(item.data)}
            className={`gtm-btn-memorytext-load`}
          >
            {item.name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    );
  };

  return (
    <>
      <Tooltip title="Texto padrão">
        <Dropdown overlay={mainMenu()}>
          <Button
            shape="circle"
            icon={<FileTextOutlined />}
            type="primary gtm-bt-memorytext"
            loading={isFetching}
          />
        </Dropdown>
      </Tooltip>

      <SaveModal
        save={saveCurrent}
        open={saveModalOpen}
        setOpen={setSaveModalOpen}
      />
    </>
  );
}
