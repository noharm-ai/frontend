import React, { useState, useEffect } from "react";
import isEmpty from "lodash.isempty";
import {
  FileTextOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Dropdown from "components/Dropdown";
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
  const { t } = useTranslation();
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

  const menuOptions = () => {
    const textOptions = textMenu();

    const items = [
      {
        key: "apply",
        label: t("labels.apply"),
        id: "gtm-bt-clinicalnotes-apply",
        children: textOptions,
      },
      {
        type: "divider",
      },
      {
        key: "save",
        label: t("labels.new"),
        icon: <SaveOutlined />,
        id: "gtm-bt-clinicalnotes-new",
        disabled: !canSave,
      },
      {
        key: "admin",
        label: t("labels.manage"),
        icon: <SettingOutlined />,
        id: "gtm-bt-clinicalnotes-manage",
        disabled: !canSave,
      },
    ];

    return {
      items,
      onClick: handleMenuClick,
    };
  };

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "save":
        setSaveModalOpen(true);
        break;

      case "admin":
        setConfigModalOpen(true);
        break;

      default:
        loadText(
          list[0].value.filter(
            (item) => item.active || !item.hasOwnProperty("active")
          )[key]?.data
        );
    }
  };

  const textMenu = () => {
    if (isEmpty(list) || isEmpty(list[0].value)) {
      return [
        {
          key: "empty",
          label: "Nenhum texto padrão encontrado.",
          disabled: true,
        },
      ];
    }

    return list[0].value
      .filter((item) => item.active || !item.hasOwnProperty("active"))
      .map((item, index) => {
        return {
          key: index,
          id: "gtm-btn-memorytext-load",
          label: item.name,
        };
      });
  };

  return (
    <>
      <Tooltip title="Texto padrão">
        <Dropdown menu={menuOptions()}>
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
