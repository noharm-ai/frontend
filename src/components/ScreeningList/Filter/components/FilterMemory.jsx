import React, { useEffect, useState } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { FilterOutlined, DeleteOutlined } from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Menu from "components/Menu";
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
      return (
        <Menu.SubMenu title={title} key={`nofilter_${type}`}>
          <Menu.Item key={`nofilteritem_${type}`}>
            {t("screeningList.noFilter")}
            <br /> {t("screeningList.noFilterHint")}
          </Menu.Item>
        </Menu.SubMenu>
      );
    }

    return (
      <Menu.SubMenu title={title} key={`sub_${type}`}>
        {list[0].value.filter(filterActive).map((item) => (
          <Menu.Item
            key={`${type}_${item.name}`}
            onClick={() => loadFilterAction(item.data)}
            className={`gtm-btn-menu-filter-load-${type}`}
          >
            {item.name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    );
  };

  const removeFilterSubmenu = (list, type) => {
    const title = t(`screeningList.${type}FilterRemove`);

    if (list && list.length && !isEmpty(list[0].value)) {
      return (
        <Menu.SubMenu title={title} key={`remove_${type}`}>
          {list[0].value.map((item, index) => (
            <>
              {(item.active || !item.hasOwnProperty("active")) && (
                <Menu.Item
                  key={`remove_${type}_${item.name}`}
                  onClick={() => removeFilterAction(index, type)}
                  style={{ color: "#ff4d4f" }}
                  className={`gtm-btn-menu-filter-remove-${type}`}
                >
                  <DeleteOutlined style={{ fontSize: 16, color: "#ff4d4f" }} />
                  {item.name}
                </Menu.Item>
              )}
            </>
          ))}
        </Menu.SubMenu>
      );
    }

    return null;
  };

  const filterMenu = () => (
    <Menu forceSubMenuRender={true}>
      <Menu.Item
        key="save-filter"
        className="gtm-btn-menu-filter-save"
        onClick={() => setSaveFilterOpen(true)}
      >
        {t("screeningList.saveFilter")}
      </Menu.Item>

      {filterSubmenu(privateFilters, "private")}
      {filterSubmenu(publicFilters, "public")}

      <Menu.Divider />

      {removeFilterSubmenu(privateFilters, "private")}
      {removeFilterSubmenu(publicFilters, "public")}
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={filterMenu()}>
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
