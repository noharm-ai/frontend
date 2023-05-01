import React, { useEffect, useState } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { FilterOutlined, DeleteOutlined } from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import {
  FILTER_PRIVATE_STORE_ID,
  FILTER_PRIVATE_MEMORY_TYPE,
  FILTER_PUBLIC_STORE_ID,
  FILTER_PUBLIC_MEMORY_TYPE,
} from "utils/memory";
import notification from "components/notification";
import SaveFilterModal from "./SaveFilterModal";

export default function FilterMemory({
  fetchMemory,
  account,
  publicFilters,
  privateFilters,
  saveMemory,
  filter,
  setScreeningListFilter,
  loadFilter,
}) {
  const [saveFilterOpen, setSaveFilterOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchMemory(
      FILTER_PRIVATE_STORE_ID,
      `${FILTER_PRIVATE_MEMORY_TYPE}_${account.userId}`
    );
    fetchMemory(FILTER_PUBLIC_STORE_ID, FILTER_PUBLIC_MEMORY_TYPE);
  }, [account.userId, fetchMemory]);

  const filterActive = (item) => item.active || !item.hasOwnProperty("active");

  const saveFilterAction = (filterName, filterType) => {
    if (filterType === "public") {
      const hasFilter = publicFilters && publicFilters.length;
      const filters = hasFilter ? [...publicFilters[0].value] : [];
      filters.push({
        name: filterName,
        data: filter,
      });

      saveMemory(FILTER_PUBLIC_STORE_ID, {
        id: hasFilter ? publicFilters[0].key : null,
        type: FILTER_PUBLIC_MEMORY_TYPE,
        value: filters,
      });
    } else {
      const hasFilter = privateFilters && privateFilters.length;
      const filters = hasFilter ? [...privateFilters[0].value] : [];
      filters.push({
        name: filterName,
        data: filter,
      });

      saveMemory(FILTER_PRIVATE_STORE_ID, {
        id: hasFilter ? privateFilters[0].key : null,
        type: `${FILTER_PRIVATE_MEMORY_TYPE}_${account.userId}`,
        value: filters,
      });
    }

    notification.success({ message: "Uhu! Filtro salvo com sucesso!" });
  };

  const removeFilterAction = (index, type) => {
    console.log("remove", index, type);

    const storeElement =
      type === "public" ? publicFilters[0] : privateFilters[0];
    const filters = [...storeElement.value];

    filters[index].active = false;

    if (type === "public") {
      saveMemory(FILTER_PUBLIC_STORE_ID, {
        id: storeElement.key,
        type: FILTER_PUBLIC_MEMORY_TYPE,
        value: filters,
      });
    } else {
      saveMemory(FILTER_PRIVATE_STORE_ID, {
        id: storeElement.key,
        type: `${FILTER_PRIVATE_MEMORY_TYPE}_${account.userId}`,
        value: filters,
      });
    }

    notification.success({ message: "Filtro removido com sucesso!" });
  };

  const loadFilterAction = (filterData) => {
    setScreeningListFilter(filterData);
    loadFilter(filterData);
  };

  const filterSubmenu = (list, type) => {
    const title = t(`screeningList.${type}Filter`);

    if (
      isEmpty(list) ||
      isEmpty(list[0].value) ||
      isEmpty(list[0].value.filter(filterActive))
    ) {
      return {
        key: `filter_${type}`,
        label: title,
        children: [
          {
            key: `filter_empty_${type}`,
            label: t("screeningList.noFilter"),
          },
        ],
      };
    }

    return {
      key: `filter_${type}`,
      label: title,
      children: list[0].value.filter(filterActive).map((item, index) => ({
        key: `${type}_${item.name}_${index}`,
        label: item.name,
        id: `gtm-btn-menu-filter-load-${type}`,
        data: item.data,
      })),
    };
  };

  const removeFilterSubmenu = (list, type) => {
    const title = t(`screeningList.${type}FilterRemove`);
    const children = [];

    if (list && list.length && !isEmpty(list[0].value)) {
      list[0].value.forEach((item, index) => {
        if (filterActive(item)) {
          children.push({
            key: `remove_${type}_${item.name}_${index}`,
            label: item.name,
            icon: <DeleteOutlined style={{ fontSize: 16 }} />,
            id: `gtm-btn-menu-filter-remove-${type}`,
            danger: true,
            index: index,
            filtertype: type,
          });
        }
      });

      return {
        key: `remove_${type}`,
        label: title,
        children,
      };
    }

    return null;
  };

  const filterMenu = () => {
    const items = [
      {
        key: "save",
        label: t("screeningList.saveFilter"),
        id: "gtm-btn-menu-filter-save",
      },
    ];

    items.push(filterSubmenu(privateFilters, "private"));
    items.push(filterSubmenu(publicFilters, "public"));

    items.push({ type: "divider" });

    items.push(removeFilterSubmenu(privateFilters, "private"));
    items.push(removeFilterSubmenu(publicFilters, "public"));

    return items;
  };

  const handleMenu = (item) => {
    switch (item.key) {
      case "save":
        setSaveFilterOpen(true);

        break;
      default:
        if (item?.item?.props?.data) {
          loadFilterAction(item?.item?.props?.data);
        }

        if (item?.item?.props?.filtertype) {
          removeFilterAction(
            item?.item?.props?.index,
            item?.item?.props?.filtertype
          );
        }
    }
  };

  return (
    <>
      <Dropdown menu={{ items: filterMenu(), onClick: handleMenu }}>
        <Button
          className="gtm-btn-filter"
          shape="circle"
          icon={<FilterOutlined />}
          style={{ marginTop: "11px", marginLeft: "5px" }}
        />
      </Dropdown>
      <SaveFilterModal
        setSaveFilterOpen={setSaveFilterOpen}
        saveFilterAction={saveFilterAction}
        open={saveFilterOpen}
      />
    </>
  );
}
