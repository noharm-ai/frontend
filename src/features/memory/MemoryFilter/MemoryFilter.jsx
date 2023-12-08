import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  SaveOutlined,
  FolderOpenOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import MemoryFilterSave from "./MemoryFilterSave";
import MemoryFilterLoad from "./MemoryFilterLoad";

function MemoryFilter({ type, currentValue, setFilter, loading }) {
  const [modalLoadVisible, setModalLoadVisible] = useState(false);
  const [modalSaveVisible, setModalSaveVisible] = useState(false);
  const status = useSelector(
    (state) => state.memoryFilter[type]?.status || "loading"
  );

  const items = [
    {
      key: "load",
      label: "Abrir filtros salvos",
      icon: <FolderOpenOutlined />,
    },
    {
      key: "save",
      label: "Salvar filtro atual",
      icon: <SaveOutlined />,
    },
  ];

  const onMenuClick = ({ key }) => {
    switch (key) {
      case "load":
        setModalLoadVisible(true);
        break;

      case "save":
        setModalSaveVisible(true);
        break;

      default:
        console.error("Not implemented", key);
    }
  };

  return (
    <>
      <Dropdown
        menu={{ items, onClick: onMenuClick }}
        loading={status === "loading"}
      >
        <Button
          shape="circle"
          icon={<FilterOutlined />}
          style={{ marginTop: "11px", marginLeft: "5px" }}
          loading={loading}
        />
      </Dropdown>
      <MemoryFilterSave
        setOpen={setModalSaveVisible}
        open={modalSaveVisible}
        type={type}
        currentValue={currentValue}
      />
      <MemoryFilterLoad
        setOpen={setModalLoadVisible}
        open={modalLoadVisible}
        type={type}
        setFilter={setFilter}
      />
    </>
  );
}

export default MemoryFilter;
