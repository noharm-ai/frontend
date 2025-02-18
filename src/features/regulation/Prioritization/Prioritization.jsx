import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination, Flex } from "antd";
import { CheckOutlined, BorderOutlined } from "@ant-design/icons";
import { uniq } from "utils/lodash";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import Dropdown from "components/Dropdown";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import Filter from "./Filter/Filter";
import Order from "./Order/Order";
import columns from "./Table/columns";
import expandedRowRender from "./Table/expandedRowRender";
import {
  setCurrentPage,
  fetchRegulationList,
  fetchPatients,
  setSelectedRows,
  setSelectedRowsActive,
  toggleSelectedRows,
  setMultipleActionIds,
  setMultipleActionModal,
} from "./PrioritizationSlice";
import RegulationMultipleAction from "./RegulationMultipleAction/RegulationMultipleAction";

export default function Prioritization() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector((state) => state.regulation.prioritization.status);
  const selectedRows = useSelector(
    (state) => state.regulation.prioritization.selectedRows.list
  );
  const selectedRowsActive = useSelector(
    (state) => state.regulation.prioritization.selectedRows.active
  );

  const [expandedRows, setExpandedRows] = useState([]);
  const page = useSelector(
    (state) => state.regulation.prioritization.currentPage
  );
  const count = useSelector((state) => state.regulation.prioritization.count);
  const filters = useSelector(
    (state) => state.regulation.prioritization.filters
  );
  const order = useSelector((state) => state.regulation.prioritization.order);
  const datasource = useSelector(
    (state) => state.regulation.prioritization.list
  );
  const selectAllRows = () => {
    let rows = datasource || [];

    rows = rows.map((i) => i.id);

    if (rows.length > 0) {
      if (isAllSelected()) {
        dispatch(
          setSelectedRows(selectedRows.filter((s) => rows.indexOf(s) === -1))
        );
      } else {
        const allRows = [...selectedRows, ...rows];
        dispatch(setSelectedRows(uniq(allRows)));
      }
    }
  };

  const isAllSelected = () => {
    if (!selectedRows.length) return false;

    let selected = true;
    let rows = datasource || [];

    rows = rows.map((i) => i.id);

    rows.forEach((r) => {
      if (selectedRows.indexOf(r) === -1) {
        selected = false;
      }
    });

    return selected;
  };
  const bag = {
    dispatch,
    setSelectedRows,
    toggleSelectedRows,
    selectedRowsActive,
    selectedRows,
    isAllSelected: isAllSelected(),
    selectAllRows,
  };

  useEffect(() => {
    if (status === "succeeded") {
      dispatch(fetchPatients());
    }
  }, [dispatch, status]);

  const limit = 100;

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit, order };
    setExpandedRows([]);

    dispatch(fetchRegulationList(params));
  };

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.id));
  };

  const ExpandColumn = ({ expand }) => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className={`expand-all ant-table-row-expand-icon ${
            expand ? "ant-table-row-expand-icon-collapsed" : ""
          }`}
          onClick={toggleExpansion}
        ></button>
      </div>
    );
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(datasource.map((d) => d.id));
    }
  };

  const actionOptions = () => {
    const items = [
      {
        key: "action",
        label: "Ação Múltipla",
        icon: <CheckOutlined style={{ fontSize: "16px" }} />,
        disabled: selectedRows.length === 0,
      },
      {
        type: "divider",
      },
      {
        key: "reset",
        label: "Remover seleção",
        icon: <BorderOutlined style={{ fontSize: "16px" }} />,
        disabled: !selectedRowsActive,
      },
    ];

    return {
      items,
      onClick: handleActionClick,
    };
  };

  const handleActionClick = ({ key }) => {
    switch (key) {
      case "reset":
        dispatch(setSelectedRowsActive(false));
        break;
      case "action": {
        const actionList = datasource.filter(
          (item) => selectedRows.indexOf(item.id) !== -1
        );

        dispatch(setMultipleActionIds(actionList));
        dispatch(setMultipleActionModal(true));

        break;
      }

      default:
        console.error(key);
    }
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Regulação</h1>
        </div>
        <div className="page-header-actions"></div>
      </PageHeader>
      <Filter limit={limit} />

      <Flex justify="space-between" align="center">
        <div style={{ flex: 1 }}>
          <Order limit={limit} />
        </div>
        <div>
          <Pagination
            onChange={onPageChange}
            current={page}
            total={count}
            showSizeChanger={false}
            pageSize={limit}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} de ${total} itens`
            }
          />
        </div>
      </Flex>

      <PageCard>
        <Flex justify="end" align="center">
          <div>
            <Dropdown.Button
              style={{ marginBottom: "1.5rem" }}
              menu={actionOptions()}
              type={selectedRowsActive ? "primary" : "default"}
              onClick={() =>
                !selectedRowsActive
                  ? dispatch(setSelectedRowsActive(true))
                  : false
              }
            >
              {selectedRowsActive
                ? `${selectedRows.length} selecionados`
                : "Ativar seleção múltipla"}
            </Dropdown.Button>
          </div>
        </Flex>
        <ExpandableTable
          columns={columns(t, bag)}
          pagination={false}
          loading={status === "loading"}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma solicitação encontrada."
              />
            ),
          }}
          rowKey="id"
          dataSource={status !== "loading" ? datasource : []}
          showSorterTooltip={false}
          expandedRowRender={expandedRowRender}
          expandedRowKeys={expandedRows}
          columnTitle={<ExpandColumn expand={!expandedRows.length} />}
          onExpand={(expanded, record) => handleRowExpand(record)}
        />
      </PageCard>
      <PaginationContainer>
        <Pagination
          onChange={onPageChange}
          current={page}
          total={count}
          pageSize={limit}
          showSizeChanger={false}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`
          }
        />
      </PaginationContainer>
      <RegulationMultipleAction />
    </>
  );
}
