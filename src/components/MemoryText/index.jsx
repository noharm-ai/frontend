import React, { useState, useEffect } from "react";
import isEmpty from "lodash.isempty";
import {
  FileTextOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Menu from "components/Menu";
import Tooltip from "components/Tooltip";
import Button from "components/Button";

import SaveModal from "./components/SaveModal";
import ConfigModal from "./components/ConfigModal";

export default function MemoryText({
  fetch,
  save,
  storeId,
  memoryType,
  memory,
  onLoad,
  canSave = true,
}) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const { isFetching, list } = memory[storeId] || {
    isFetching: true,
    list: [],
  };

  useEffect(() => {
    fetch(storeId, memoryType);
  }, [fetch, storeId, memoryType]);

  const saveCurrent = (name, newText) => {
    const hasMemory = list.length > 0;
    const texts = hasMemory ? [...list[0].value] : [];
    texts.push({
      name,
      data: newText,
    });

    save(storeId, {
      id: hasMemory ? list[0].key : null,
      type: memoryType,
      value: texts,
    });
  };

  const saveAll = (newList) => {
    const hasMemory = list.length > 0;

    if (!hasMemory) return;

    save(storeId, {
      id: list[0].key,
      type: memoryType,
      value: newList,
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
          <Menu.Item
            onClick={() => setSaveModalOpen(true)}
            key="save"
            icon={<SaveOutlined />}
          >
            <span>Novo</span>
          </Menu.Item>
          <Menu.Item
            onClick={() => setConfigModalOpen(true)}
            disabled={isEmpty(list) || isEmpty(list[0].value)}
            key="admin"
            icon={<SettingOutlined />}
          >
            <span>Gerenciar</span>
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
        <Menu.SubMenu title={title} key="empty">
          <Menu.Item disabled>Nenhum texto padrão encontrado.</Menu.Item>
        </Menu.SubMenu>
      );
    }

    return (
      <Menu.SubMenu title={title} key="list">
        {list[0].value
          .filter((item) => item.active || !item.hasOwnProperty("active"))
          .map((item, index) => (
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
        loadText={loadText}
        memoryType={memoryType}
      />

      <ConfigModal
        save={saveAll}
        open={configModalOpen}
        setOpen={setConfigModalOpen}
        list={list}
      />
    </>
  );
}
