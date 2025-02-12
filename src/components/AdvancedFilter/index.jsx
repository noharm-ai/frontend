import React, { useState } from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import {
  SearchOutlined,
  DeleteOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { Row, Col } from "components/Grid";
import Badge from "components/Badge";
import MemoryFilter from "features/memory/MemoryFilter/MemoryFilter";

import { SearchBox, FilterCard } from "./index.style";

/* eslint-disable-next-line react-refresh/only-export-components */
export const AdvancedFilterContext = React.createContext({});

export default function AdvancedFilter({
  mainFilters,
  secondaryFilters,
  initialValues,
  onSearch,
  onChangeValues,
  loading,
  skipFilterList,
  skipMemoryList = {},
  memoryType,
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const { t } = useTranslation();

  const setFieldValue = (newValues) => {
    setValues({ ...values, ...newValues });
    if (onChangeValues) {
      onChangeValues({ ...values, ...newValues });
    }
  };

  const countHiddenFilters = (filters) => {
    const skip = skipFilterList;
    let count = 0;

    Object.keys(filters).forEach((key) => {
      if (skip.indexOf(key) !== -1) return;

      if (
        !isEmpty(filters[key]) ||
        filters[key] === true ||
        filters[key] === 1
      ) {
        count++;
      }
    });

    return count;
  };

  const search = () => {
    setOpen(false);
    onSearch(values);
  };

  const reset = () => {
    setValues(initialValues);
    if (onChangeValues) {
      onChangeValues(initialValues);
    }

    setOpen(false);
    onSearch(initialValues);
  };

  const loadFilter = (filter) => {
    const newFilters = {};
    Object.keys(filter).forEach((k) => {
      if (!skipMemoryList[k]) {
        newFilters[k] = filter[k];
      }
    });

    Object.keys(skipMemoryList).forEach((k) => {
      if (skipMemoryList[k] === "daterange") {
        newFilters[k] = [dayjs(values[k][0]), dayjs(values[k][1])];
      } else {
        newFilters[k] = initialValues[k];
      }
    });

    const mergedFilters = { ...initialValues, ...newFilters };

    setValues(mergedFilters);
    onSearch(mergedFilters);
  };

  const hiddenFieldCount = countHiddenFilters(values);

  return (
    <FilterCard>
      <SearchBox className={open ? "open" : ""}>
        <AdvancedFilterContext.Provider value={{ values, setFieldValue }}>
          <Row gutter={[16, 16]} type="flex">
            {mainFilters}
            <Col md={4}>
              <div style={{ display: "flex" }}>
                {secondaryFilters && (
                  <Tooltip
                    title={
                      hiddenFieldCount > 0
                        ? "Existem mais filtros aplicados"
                        : ""
                    }
                  >
                    <Button
                      type="link gtm-btn-adv-search"
                      onClick={() => setOpen(!open)}
                      style={{ marginTop: "14px", paddingLeft: 0 }}
                    >
                      <Badge count={hiddenFieldCount}>
                        {t("screeningList.seeMore")}
                      </Badge>
                      {open ? <CaretUpOutlined /> : <CaretDownOutlined />}
                    </Button>
                  </Tooltip>
                )}

                <Tooltip title={t("screeningList.search")}>
                  <Button
                    type="secondary"
                    className="gtm-btn-search"
                    shape="circle"
                    icon={<SearchOutlined />}
                    onClick={search}
                    size="large"
                    style={{ marginTop: "7px" }}
                    loading={loading}
                  />
                </Tooltip>
                <Tooltip title={t("screeningList.resetFilter")}>
                  <Button
                    className="gtm-btn-reset"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={reset}
                    style={{ marginTop: "11px", marginLeft: "5px" }}
                    loading={loading}
                  />
                </Tooltip>
                {memoryType && (
                  <MemoryFilter
                    type={memoryType}
                    currentValue={values}
                    setFilter={loadFilter}
                    loading={loading}
                  />
                )}
              </div>
            </Col>
          </Row>
          {secondaryFilters && (
            <div className="filters">{secondaryFilters}</div>
          )}
        </AdvancedFilterContext.Provider>
      </SearchBox>
    </FilterCard>
  );
}
