import { useState, useEffect } from "react";
import type { MenuProps } from "antd";
import {
  FileTextOutlined,
  FileProtectOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";

import Dropdown from "components/Dropdown";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { useAppDispatch, useAppSelector } from "store/index";

import { fetchMemoryThunk, saveMemoryThunk } from "./MemoryTextSlice";
import type { IMemoryRecord } from "./MemoryTextSlice";
import { SaveModal } from "./SaveModal/SaveModal";
import { ConfigModal } from "./ConfigModal/ConfigModal";

/** A saved text: `active: false` hides it without deleting it. */
interface IMemoryTextItem {
  name: string;
  data: string;
  active?: boolean;
}

/** The variables offered when a text is saved (see SaveModal). */
export interface IMemoryTextVariableGroup {
  label: string;
  items: { key: string; label: string }[];
}

interface IMemoryTextProps {
  storeId: string;
  memoryType: string;
  onLoad: (text: string) => void;
  canSave?: boolean;
  privateMemory?: boolean;
  variableGroups?: IMemoryTextVariableGroup[] | null;
}

// the user duck is still untyped JS
interface IUserState {
  account: { userId: number | string };
}

// until the first fetch starts the texts count as loading
const NOT_LOADED = {
  isFetching: true,
  list: [] as IMemoryRecord<IMemoryTextItem[]>[],
};

export function MemoryText({
  storeId,
  memoryType,
  onLoad,
  canSave = true,
  privateMemory = false,
  variableGroups = null,
}: IMemoryTextProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const userId = useAppSelector(
    (state) => (state.user as unknown as IUserState).account.userId,
  );
  const { isFetching, list } =
    (useAppSelector((state) => state.memoryText.stores[storeId]) as
      | typeof NOT_LOADED
      | undefined) ?? NOT_LOADED;
  const memoryTypeInternal = privateMemory
    ? `${memoryType}_${userId}`
    : memoryType;

  useEffect(() => {
    dispatch(fetchMemoryThunk({ storeId, type: memoryTypeInternal })).then(
      (action: unknown) => {
        if (fetchMemoryThunk.rejected.match(action)) {
          console.error("Error fetching memory:", action.payload);
        }
      },
    );
  }, [dispatch, storeId, memoryTypeInternal]);

  const save = (id: IMemoryRecord["key"] | null, value: IMemoryTextItem[]) => {
    dispatch(
      saveMemoryThunk({
        storeId,
        params: { id, type: memoryTypeInternal, value },
      }),
    );
  };

  const saveCurrent = (name: string, newText: string) => {
    const hasMemory = list.length > 0;
    const texts = hasMemory ? [...list[0].value] : [];
    texts.push({
      name,
      data: newText,
    });

    save(hasMemory ? list[0].key : null, texts);
  };

  const saveAll = (newList: IMemoryTextItem[]) => {
    const hasMemory = list.length > 0;

    if (!hasMemory) return;

    save(list[0].key, newList);
  };

  const loadText = (text: string) => {
    onLoad(text);
  };

  const filterActive = (item: IMemoryTextItem) =>
    item.active || !Object.prototype.hasOwnProperty.call(item, "active");

  const filterAndSort = (items: IMemoryTextItem[]) => {
    return items
      .filter(filterActive)
      .sort((a, b) => `${a?.name}`.localeCompare(`${b?.name}`));
  };

  // antd forwards `id` to the menu item element, but its types don't declare
  // it (the gtm-* ids are read by the analytics tags)
  type MenuItems = NonNullable<MenuProps["items"]>;

  const textMenu = (): MenuItems => {
    const filters = list && list[0]?.value ? list[0].value : [];

    if (filters.filter((item) => filterActive(item)).length === 0) {
      return [
        {
          key: "empty",
          label: "Nenhum texto padrão encontrado.",
          disabled: true,
        },
      ];
    }

    return filterAndSort(list[0].value).map((item, index) => {
      return {
        key: index,
        id: "gtm-btn-memorytext-load",
        label: item.name,
      };
    }) as MenuItems;
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "save":
        setSaveModalOpen(true);
        break;

      case "admin":
        setConfigModalOpen(true);
        break;

      default:
        loadText(filterAndSort(list[0].value)[Number(key)]?.data);
    }
  };

  const menuOptions = (): MenuProps => {
    const items = [
      {
        key: "apply",
        label: t("labels.apply"),
        id: "gtm-bt-clinicalnotes-apply",
        children: textMenu(),
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
        disabled:
          !canSave || isEmpty(list && list[0]?.value ? list[0].value : []),
      },
    ] as MenuItems;

    return {
      items,
      onClick: handleMenuClick,
    };
  };

  return (
    <>
      <Tooltip
        title={
          privateMemory ? "Texto padrão (privado)" : "Texto padrão (público)"
        }
      >
        <span>
          <Dropdown menu={menuOptions()}>
            <Button
              shape="circle"
              icon={
                privateMemory ? <FileProtectOutlined /> : <FileTextOutlined />
              }
              type={privateMemory ? "default" : "primary"}
              className="gtm-bt-memorytext"
              loading={isFetching}
            />
          </Dropdown>
        </span>
      </Tooltip>

      <SaveModal
        save={saveCurrent}
        open={saveModalOpen}
        setOpen={setSaveModalOpen}
        loadText={loadText}
        memoryType={memoryTypeInternal}
        variableGroups={variableGroups}
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
