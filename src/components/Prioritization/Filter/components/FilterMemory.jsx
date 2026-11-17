import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { FilterOutlined, LoadingOutlined } from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import {
  FILTER_PRIVATE_STORE_ID,
  FILTER_PRIVATE_MEMORY_TYPE,
  FILTER_PUBLIC_STORE_ID,
  FILTER_PUBLIC_MEMORY_TYPE,
} from "utils/memory";
import notification from "components/notification";
import {
  fetchMemoryThunk,
  saveMemoryThunk,
} from "features/memory/MemoryText/MemoryTextSlice";
import SaveFilterModal from "./SaveFilterModal";
import ConfigModal from "./ConfigModal";
import {
  trackPrescriptionPrioritizationAction,
  TrackedPrescriptionPrioritizationAction,
} from "src/utils/tracker";

const NO_FILTERS = [];

export default function FilterMemory({
  account,
  filter,
  setScreeningListFilter,
  loadFilter,
}) {
  const [saveFilterOpen, setSaveFilterOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const privateFilters = useSelector(
    (state) =>
      state.memoryText.stores[FILTER_PRIVATE_STORE_ID]?.list ?? NO_FILTERS,
  );
  const publicFilters = useSelector(
    (state) =>
      state.memoryText.stores[FILTER_PUBLIC_STORE_ID]?.list ?? NO_FILTERS,
  );

  const fetchMemory = (storeId, type) =>
    dispatch(fetchMemoryThunk({ storeId, type }));

  // shows the message only once the backend has stored the filters
  const saveMemory = (storeId, params, successMessage) =>
    dispatch(saveMemoryThunk({ storeId, params })).then((action) => {
      if (saveMemoryThunk.rejected.match(action)) {
        notification.error({ message: t("error.title") });
        return;
      }

      notification.success({ message: successMessage });
    });

  const filterActive = (item) =>
    item.active || !Object.prototype.hasOwnProperty.call(item, "active");

  const saveFilterAction = (filterName, filterType) => {
    if (filterType === "public") {
      const hasFilter = publicFilters && publicFilters.length;
      const filters = hasFilter ? [...publicFilters[0].value] : [];
      filters.push({
        name: filterName,
        data: cloneDeep(filter),
      });

      saveMemory(
        FILTER_PUBLIC_STORE_ID,
        {
          id: hasFilter ? publicFilters[0].key : null,
          type: FILTER_PUBLIC_MEMORY_TYPE,
          value: filters,
        },
        "Uhu! Filtro salvo com sucesso!",
      );
    } else {
      const hasFilter = privateFilters && privateFilters.length;
      const filters = hasFilter ? [...privateFilters[0].value] : [];
      filters.push({
        name: filterName,
        data: cloneDeep(filter),
      });

      saveMemory(
        FILTER_PRIVATE_STORE_ID,
        {
          id: hasFilter ? privateFilters[0].key : null,
          type: `${FILTER_PRIVATE_MEMORY_TYPE}_${account.userId}`,
          value: filters,
        },
        "Uhu! Filtro salvo com sucesso!",
      );
    }
  };

  const sortFilters = (a, b) => `${a?.name}`.localeCompare(`${b?.name}`);

  const removeFilterAction = (index, type) => {
    const storeElement =
      type === "public" ? publicFilters[0] : privateFilters[0];
    const filters = [...storeElement.value];

    // the saved filters are frozen store state: replace the item, don't edit it
    filters[index] = { ...filters[index], active: false };

    if (type === "public") {
      saveMemory(
        FILTER_PUBLIC_STORE_ID,
        {
          id: storeElement.key,
          type: FILTER_PUBLIC_MEMORY_TYPE,
          value: filters,
        },
        "Filtro removido com sucesso!",
      );
    } else {
      saveMemory(
        FILTER_PRIVATE_STORE_ID,
        {
          id: storeElement.key,
          type: `${FILTER_PRIVATE_MEMORY_TYPE}_${account.userId}`,
          value: filters,
        },
        "Filtro removido com sucesso!",
      );
    }
  };

  const loadFilterAction = (savedFilter) => {
    // a copy: the saved filter is frozen store state, and goes on to the
    // prioritization filter, which must not share it
    const filterData = cloneDeep(savedFilter);

    // keep compatibility between different versions
    if (filterData.idSegment && !Array.isArray(filterData.idSegment)) {
      filterData.idSegment = [filterData.idSegment];
    }

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
      children: list[0].value
        .filter(filterActive)
        .sort(sortFilters)
        .map((item, index) => ({
          key: `${type}_${item.name}_${index}`,
          label: item.name,
          id: `gtm-btn-menu-filter-load-${type}`,
          data: item.data,
        })),
    };
  };

  const loadFiltersFromMemory = () => {
    if (loaded || loading) {
      return;
    }

    setLoading(true);

    Promise.all([
      fetchMemory(
        FILTER_PRIVATE_STORE_ID,
        `${FILTER_PRIVATE_MEMORY_TYPE}_${account.userId}`,
      ),
      fetchMemory(FILTER_PUBLIC_STORE_ID, FILTER_PUBLIC_MEMORY_TYPE),
    ]).then((actions) => {
      setLoading(false);

      // both lists must be known before a filter is saved into them:
      // otherwise the save starts a new record and hides the existing one.
      // Left not loaded, the next click on the button tries again
      if (actions.some((action) => fetchMemoryThunk.rejected.match(action))) {
        notification.error({ message: t("error.title") });
        return;
      }

      setLoaded(true);
    });
  };

  const filterMenu = () => {
    const items = [
      {
        key: "save",
        label: t("screeningList.saveFilter"),
        id: "gtm-btn-menu-filter-save",
        // saving appends to the loaded lists, so wait for them
        disabled: !loaded,
      },
    ];

    items.push(filterSubmenu(privateFilters, "private"));
    items.push(filterSubmenu(publicFilters, "public"));

    items.push({ type: "divider" });

    items.push({
      key: "remove",
      label: "Gerenciar filtros",
      danger: true,
      disabled: !loaded,
    });

    return items;
  };

  const handleMenu = (item) => {
    switch (item.key) {
      case "save":
        setSaveFilterOpen(true);
        trackPrescriptionPrioritizationAction(
          TrackedPrescriptionPrioritizationAction.SAVE_FILTER
        );

        break;
      case "remove":
        setConfigModalOpen(true);

        trackPrescriptionPrioritizationAction(
          TrackedPrescriptionPrioritizationAction.MANAGE_FILTERS
        );

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
      <Dropdown
        menu={{ items: filterMenu(), onClick: handleMenu }}
        trigger={["click"]}
      >
        <Button
          className="gtm-btn-filter"
          shape="circle"
          icon={loading ? <LoadingOutlined /> : <FilterOutlined />}
          style={{ marginTop: "11px", marginLeft: "5px" }}
          onClick={() => loadFiltersFromMemory()}
        />
      </Dropdown>
      <SaveFilterModal
        setSaveFilterOpen={setSaveFilterOpen}
        saveFilterAction={saveFilterAction}
        open={saveFilterOpen}
      />
      <ConfigModal
        setOpen={setConfigModalOpen}
        open={configModalOpen}
        privateFilters={privateFilters}
        publicFilters={publicFilters}
        removeFilterAction={removeFilterAction}
        filterActive={filterActive}
      />
    </>
  );
}
