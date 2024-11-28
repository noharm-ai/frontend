import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination, Flex } from "antd";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import Filter from "./Filter/Filter";
import Order from "./Order/Order";
import columns from "./Table/columns";
import expandedRowRender from "./Table/expandedRowRender";
import { setCurrentPage, fetchRegulationList } from "./PrioritizationSlice";

export default function Prioritization() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isFetching =
    useSelector((state) => state.regulation.prioritization.status) ===
    "loading";

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

  const limit = 30;

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
      </Flex>

      <PageCard>
        <ExpandableTable
          columns={columns(t)}
          pagination={false}
          loading={isFetching}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma solicitação encontrada."
              />
            ),
          }}
          rowKey="id"
          dataSource={!isFetching ? datasource : []}
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
    </>
  );
}
