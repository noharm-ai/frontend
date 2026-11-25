import { useState } from "react";
import {
  SaveOutlined,
  FolderOpenOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import { MemoryFilterSave } from "./MemoryFilterSave";
import { MemoryFilterLoad } from "./MemoryFilterLoad";

interface IMemoryFilterProps {
  // memory type the filters are saved under (e.g. intervention_list_<userId>)
  type: string;
  // the AdvancedFilter values saved by "Salvar filtro atual"
  currentValue: Record<string, unknown>;
  setFilter: (filter: Record<string, unknown>) => void;
  loading?: boolean;
}

export function MemoryFilter({
  type,
  currentValue,
  setFilter,
  loading,
}: IMemoryFilterProps) {
  const [modalLoadVisible, setModalLoadVisible] = useState(false);
  const [modalSaveVisible, setModalSaveVisible] = useState(false);

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

  const onMenuClick = ({ key }: { key: string }) => {
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
      <Dropdown menu={{ items, onClick: onMenuClick }}>
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
